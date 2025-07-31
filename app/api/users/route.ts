import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../Backend/services/collections/UserService';
import { verifyAuth } from '../../../Backend/utils/authVerifier';

const userService = new UserService();

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const id = await userService.createUser(data, auth.uid);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (id) {
      const user = await userService.getById(id);
      if (user) {
        return NextResponse.json(user);
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    } else if (email) {
      const user = await userService.getByEmail(email);
      if (user) {
        return NextResponse.json(user);
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    } else {
      const users = await userService.getAll();
      return NextResponse.json(users);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
