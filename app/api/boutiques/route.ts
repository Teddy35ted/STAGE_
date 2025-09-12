import { NextRequest, NextResponse } from 'next/server';
import { BoutiqueService } from '../../Backend/services/collections/BoutiqueService';
import { verifyAuth } from '../../Backend/utils/authVerifier';

const boutiqueService = new BoutiqueService();

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const id = await boutiqueService.create({ ...data, idCompte: auth.uid });
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création de la boutique' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const boutique = await boutiqueService.getById(id);
      if (boutique) {
        return NextResponse.json(boutique);
      } else {
        return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 });
      }
    } else {
      const boutiques = await boutiqueService.getAll();
      return NextResponse.json(boutiques);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors du chargement des boutiques' }, { status: 500 });
  }
}
