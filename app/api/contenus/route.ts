import { NextRequest, NextResponse } from 'next/server';
import { ContenuService } from '../../Backend/services/collections/ContenuService';
import { UserService } from '../../Backend/services/collections/UserService';
import { verifyAuth } from '../../Backend/utils/authVerifier';

const contenuService = new ContenuService();
const userService = new UserService();

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { position, ...contenuCore } = data;

    console.log('📝 Création contenu pour utilisateur:', auth.uid);
    console.log('📄 Données contenu:', data);

    // Validation des données
    try {
      const { validateContenuCore } = await import('../../Backend/utils/validation');
      const validationResult = validateContenuCore({ ...contenuCore, idCreateur: auth.uid });
      
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
    let creatorInfo = await userService.getCreatorInfo(auth.uid);

    // Si l'utilisateur n'existe pas, le créer automatiquement
    if (!creatorInfo) {
      console.log('👤 Utilisateur non trouvé, création automatique...');
      
      // Créer un utilisateur par défaut
      const defaultUserData = {
        nom: data.nomCreateur || 'Utilisateur',
        prenom: 'Dashboard',
        email: data.emailCreateur || 'user@example.com',
        tel: '00000000',
        password: 'defaultpassword',
        date_de_naissance: '1990-01-01',
        sexe: 'Masculin' as const,
        pays: 'Togo',
        ville: 'Lomé',
        codePays: '+228'
      };
      
      await userService.createUser(defaultUserData, auth.uid);
      console.log('✅ Utilisateur créé automatiquement');
      
      // Récupérer les informations du créateur nouvellement créé
      creatorInfo = await userService.getCreatorInfo(auth.uid);
    }

    if (!creatorInfo) {
      console.error('❌ Impossible de créer ou récupérer les informations du créateur');
      return NextResponse.json({ 
        error: 'Creator not found and could not be created',
        details: 'Impossible de créer automatiquement l\'utilisateur'
      }, { status: 404 });
    }

    console.log('👤 Créateur trouvé/cr��é:', creatorInfo.nom);

    const id = await contenuService.createContenu(
      { ...contenuCore, idCreateur: auth.uid }, 
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
  // Vérifier l'authentification pour toutes les opérations de lecture
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const laalaId = searchParams.get('laalaId');

    if (id) {
      const contenu = await contenuService.getById(id);
      if (contenu) {
        return NextResponse.json(contenu);
      } else {
        return NextResponse.json({ error: 'Contenu not found' }, { status: 404 });
      }
    } else if (laalaId) {
      const contenus = await contenuService.getByLaala(laalaId);
      return NextResponse.json(contenus);
    } else {
      const contenus = await contenuService.getAll();
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
