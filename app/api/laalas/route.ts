import { NextRequest, NextResponse } from 'next/server';
import { LaalaService } from '../../Backend/services/collections/LaalaService';
import { UserService } from '../../Backend/services/collections/UserService';
import { verifyAuth } from '../../Backend/utils/authVerifier';

const laalaService = new LaalaService();
const userService = new UserService();

export async function POST(request: NextRequest) {
  console.log('POST /api/laalas appelé');
  
  const auth = await verifyAuth(request);
  if (!auth) {
    console.log('Authentification échouée');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Création laala avec authentification...');
    
    const data = await request.json();
    console.log('Données reçues:', data);
    
    // Récupérer les informations du créateur
    const creatorInfo = await userService.getCreatorInfo(auth.uid);

    if (!creatorInfo) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // Créer le laala
    const id = await laalaService.createLaala(
      { ...data, idCreateur: auth.uid },
      creatorInfo
    );

    console.log('Laala créé avec ID:', id);
    
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('❌ Erreur création laala:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du laala' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  console.log('GET /api/laalas appelé');
  
  const auth = await verifyAuth(request);
  if (!auth) {
    console.log('Authentification échouée');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Récupération laalas avec authentification...');
    
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId');

    if (creatorId) {
      console.log('Récupération laalas pour créateur:', creatorId);
      const laalas = await laalaService.getByCreator(creatorId);
      return NextResponse.json(laalas);
    } else {
      console.log('Récupération laalas pour utilisateur connecté:', auth.uid);
      const laalas = await laalaService.getByCreator(auth.uid);
      return NextResponse.json(laalas);
    }
  } catch (error) {
    console.error('❌ Erreur récupération laalas:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des laalas' }, { status: 500 });
  }
}
