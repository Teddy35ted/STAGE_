import { NextRequest, NextResponse } from 'next/server';
import { RetraitService } from '../../Backend/services/collections/RetraitService';
import { verifyAuth } from '../../Backend/utils/authVerifier';

const retraitService = new RetraitService();

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const id = await retraitService.create({ ...data, idcompte: auth.uid });
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create retrait' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const compteId = searchParams.get('compteId');

    if (id) {
      const retrait = await retraitService.getById(id);
      if (retrait) {
        return NextResponse.json(retrait);
      } else {
        return NextResponse.json({ error: 'Retrait not found' }, { status: 404 });
      }
    } else if (compteId) {
      const retraits = await retraitService.getByCompte(compteId);
      return NextResponse.json(retraits);
    } else {
      const retraits = await retraitService.getAll();
      return NextResponse.json(retraits);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch retraits' }, { status: 500 });
  }
}
