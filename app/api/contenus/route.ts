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

    // Récupérer les informations du créateur
    const creatorInfo = await userService.getCreatorInfo(auth.uid);

    if (!creatorInfo) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const id = await contenuService.createContenu({ ...contenuCore, idCreateur: auth.uid }, creatorInfo, position);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create contenu' }, { status: 500 });
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
