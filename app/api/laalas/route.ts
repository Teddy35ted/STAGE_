import { NextRequest, NextResponse } from 'next/server';
import { LaalaService } from '../../../Backend/services/collections/LaalaService';
import { UserService } from '../../../Backend/services/collections/UserService';
import { verifyAuth } from '../../../Backend/utils/authVerifier';

const laalaService = new LaalaService();
const userService = new UserService();

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Récupérer les informations du créateur
    const creatorInfo = await userService.getCreatorInfo(auth.uid);

    if (!creatorInfo) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const id = await laalaService.createLaala({ ...data, idCreateur: auth.uid }, creatorInfo);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create laala' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const creatorId = searchParams.get('creatorId');

    if (id) {
      const laala = await laalaService.getById(id);
      if (laala) {
        return NextResponse.json(laala);
      } else {
        return NextResponse.json({ error: 'Laala not found' }, { status: 404 });
      }
    } else if (creatorId) {
      const laalas = await laalaService.getByCreator(creatorId);
      return NextResponse.json(laalas);
    } else {
      const laalas = await laalaService.getAll();
      return NextResponse.json(laalas);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch laalas' }, { status: 500 });
  }
}
