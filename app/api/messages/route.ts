import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '../../Backend/services/collections/MessageService';
import { verifyAuth } from '../../Backend/utils/authVerifier';

const messageService = new MessageService();

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const id = await messageService.create({ ...data, idsender: auth.uid });
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const senderId = searchParams.get('senderId');
    const receiverId = searchParams.get('receiverId');

    if (senderId && receiverId) {
      const conversation = await messageService.getConversation(senderId, receiverId);
      if (conversation) {
        return NextResponse.json(conversation);
      } else {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: 'Missing senderId or receiverId' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
