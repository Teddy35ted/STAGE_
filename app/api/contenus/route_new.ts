import { NextRequest, NextResponse } from 'next/server';
import { ContenuService } from '../../Backend/services/collections/ContenuService';
import { UserService } from '../../Backend/services/collections/UserService';
import { PermissionMiddleware } from '../../Backend/middleware/PermissionMiddleware';

const contenuService = new ContenuService();
const userService = new UserService();
const permissionMiddleware = new PermissionMiddleware();

export async function POST(request: NextRequest) {
  const permissionCheck = await permissionMiddleware.verifyPermission(request, 'contenus', 'create');
  if (!permissionCheck.isAuthorized || !permissionCheck.context) {
    return NextResponse.json({ error: permissionCheck.error || 'Unauthorized' }, { status: 401 });
  }

  const { context } = permissionCheck;

  try {
    const data = await request.json();
    const { position, ...contenuCore } = data;

    console.log('📝 Création contenu pour propriétaire:', context.proprietaireId);
    console.log('📄 Données contenu:', data);

    // Validation des données
    try {
      const { validateContenuCore } = await import('../../Backend/utils/validation');
      const validationResult = validateContenuCore({ ...contenuCore, idCreateur: context.proprietaireId });
      
      if (!validationResult.isValid) {
        console.log('❌ Validation échouée:', validationResult.errors);
        return NextResponse.json({ 
          error: 'Validation failed',
          details: validationResult.errors,
          warnings: validationResult.warnings
        }, { status: 400 });
      }
      
      if (validationResult.warnings.length > 0) {
        console.warn('⚠️ Avertissements:', validationResult.warnings);
      }
      
    } catch (validationError) {
      console.error('❌ Erreur de validation:', validationError);
      return NextResponse.json({ 
        error: 'Validation error',
        details: validationError instanceof Error ? validationError.message : 'Erreur de validation'
      }, { status: 400 });
    }

    // Récupérer les informations du créateur
    let creatorInfo = await userService.getCreatorInfo(context.proprietaireId);

    // Si l'utilisateur n'existe pas, le créer automatiquement
    if (!creatorInfo) {
      console.log('⚠️ Utilisateur non trouvé, création automatique...');
      
      const defaultUserData = {
        nom: 'Utilisateur',
        prenom: 'Nouveau',
        avatar: '',
        iscert: false,
        email: `user-${context.proprietaireId}@temp.com`,
        tel: '',
        date_de_naissance: '1990-01-01',
        sexe: 'Masculin' as const,
        pays: 'Togo',
        ville: 'Lomé',
        codePays: '+228'
      };
      
      await userService.createUser(defaultUserData, context.proprietaireId);
      console.log('✅ Utilisateur créé automatiquement');
      
      // Récupérer les informations du créateur nouvellement créé
      creatorInfo = await userService.getCreatorInfo(context.proprietaireId);
    }

    if (!creatorInfo) {
      console.error('❌ Impossible de créer ou récupérer les informations du créateur');
      return NextResponse.json({ 
        error: 'Creator not found and could not be created',
        details: 'Impossible de créer automatiquement l\'utilisateur'
      }, { status: 404 });
    }

    console.log('👤 Créateur trouvé/créé:', creatorInfo.nom);

    const id = await contenuService.createContenu(
      { ...contenuCore, idCreateur: context.proprietaireId },
      creatorInfo,
      position || 1
    );
    
    console.log('✅ Contenu créé avec ID:', id);
    
    return NextResponse.json({ 
      id,
      message: 'Contenu créé avec succès',
      creator: creatorInfo.nom
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Erreur création contenu:', error);
    return NextResponse.json({ 
      error: 'Failed to create contenu',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const permissionCheck = await permissionMiddleware.verifyPermission(request, 'contenus', 'read');
  if (!permissionCheck.isAuthorized || !permissionCheck.context) {
    return NextResponse.json({ error: permissionCheck.error || 'Unauthorized' }, { status: 401 });
  }

  const { context } = permissionCheck;

  try {
    console.log('📋 Récupération des contenus pour propriétaire:', context.proprietaireId);
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const laalaId = searchParams.get('laalaId');

    if (id) {
      const contenu = await contenuService.getById(id);
      if (contenu) {
        // Vérifier que l'utilisateur a accès à ce contenu
        if (contenu.idCreateur !== context.proprietaireId) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
        return NextResponse.json(contenu);
      } else {
        return NextResponse.json({ error: 'Contenu not found' }, { status: 404 });
      }
    } else if (laalaId) {
      // Vérifier d'abord que le laala appartient à l'utilisateur
      const { LaalaService } = await import('../../Backend/services/collections/LaalaService');
      const laalaService = new LaalaService();
      const laala = await laalaService.getById(laalaId);
      
      if (!laala || laala.idCreateur !== context.proprietaireId) {
        return NextResponse.json({ error: 'Access denied to this laala' }, { status: 403 });
      }
      
      const contenus = await contenuService.getByLaala(laalaId);
      return NextResponse.json(contenus);
    } else {
      // Retourner uniquement les contenus de l'utilisateur connecté
      const contenus = await contenuService.query([
        { field: 'idCreateur', operator: '==', value: context.proprietaireId }
      ]);
      console.log(`✅ ${contenus.length} contenus récupérés`);
      return NextResponse.json(contenus);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des contenus:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch contenus',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
