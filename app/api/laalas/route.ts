import { NextRequest, NextResponse } from 'next/server';
import { LaalaService } from '../../Backend/services/collections/LaalaService';
import { UserService } from '../../Backend/services/collections/UserService';
import { permissionMiddleware } from '../../Backend/middleware/PermissionMiddleware';

const laalaService = new LaalaService();
const userService = new UserService();

export async function POST(request: NextRequest) {
  // Vérifier les permissions pour créer un laala
  const permissionCheck = await permissionMiddleware.verifyPermission(request, 'laalas', 'create');
  if (!permissionCheck.isAuthorized || !permissionCheck.context) {
    return NextResponse.json(
      { error: permissionCheck.error || 'Permission refusée' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const context = permissionCheck.context;

    console.log(`📝 Création laala par ${context.isCoGestionnaire ? 'co-gestionnaire' : 'propriétaire'}`);

    // Récupérer les informations du créateur (toujours le propriétaire principal)
    const creatorInfo = await userService.getCreatorInfo(context.proprietaireId);

    if (!creatorInfo) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // Créer le laala avec l'ID du propriétaire principal
    const id = await laalaService.createLaala(
      { ...data, idCreateur: context.proprietaireId },
      creatorInfo
    );

    // Log d'audit pour les co-gestionnaires
    await permissionMiddleware.logCoGestionnaireAction(
      context,
      'laalas',
      'create',
      id
    );

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('❌ Erreur création laala:', error);
    return NextResponse.json({ error: 'Failed to create laala' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Vérifier les permissions pour lire les laalas
  const permissionCheck = await permissionMiddleware.verifyPermission(request, 'laalas', 'read');
  if (!permissionCheck.isAuthorized || !permissionCheck.context) {
    return NextResponse.json(
      { error: permissionCheck.error || 'Permission refusée' },
      { status: 403 }
    );
  }

  try {
    const context = permissionCheck.context;
    console.log(`📋 Récupération laalas par ${context.isCoGestionnaire ? 'co-gestionnaire' : 'propriétaire'}`);
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const creatorId = searchParams.get('creatorId');

    if (id) {
      const laala = await laalaService.getById(id);
      if (laala) {
        // Vérifier que l'utilisateur a accès à ce laala
        const hasAccess = await permissionMiddleware.validateDataAccess(context, laala.idCreateur);
        if (!hasAccess) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
        return NextResponse.json(laala);
      } else {
        return NextResponse.json({ error: 'Laala not found' }, { status: 404 });
      }
    } else if (creatorId) {
      // Vérifier que l'utilisateur demande les laalas du bon propriétaire
      const hasAccess = await permissionMiddleware.validateDataAccess(context, creatorId);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      const laalas = await laalaService.getByCreator(creatorId);
      return NextResponse.json(laalas);
    } else {
      // Par défaut, retourner uniquement les laalas du propriétaire principal
      const laalas = await laalaService.getByCreator(context.proprietaireId);
      console.log(`✅ ${laalas.length} laalas récupérés`);
      return NextResponse.json(laalas);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch laalas' }, { status: 500 });
  }
}
