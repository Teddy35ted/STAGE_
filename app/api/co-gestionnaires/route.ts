import { NextRequest, NextResponse } from 'next/server';
import { CoGestionnaireService } from '../../Backend/services/collections/CoGestionnaireService';
import { verifyAuth } from '../../Backend/utils/authVerifier';

const coGestionnaireService = new CoGestionnaireService();

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const id = await coGestionnaireService.create(data);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create co-gestionnaire' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const coGestionnaire = await coGestionnaireService.getById(id);
      if (coGestionnaire) {
        return NextResponse.json(coGestionnaire);
      } else {
        return NextResponse.json({ error: 'Co-gestionnaire not found' }, { status: 404 });
      }
    } else {
      const coGestionnaires = await coGestionnaireService.getAll();
      return NextResponse.json(coGestionnaires);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch co-gestionnaires' }, { status: 500 });
  }
}
