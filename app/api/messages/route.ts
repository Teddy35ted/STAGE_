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
    const id = await messageService.create({ ...data, idsender: auth.uid }, auth.uid);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const senderId = searchParams.get('senderId');
    const receiverId = searchParams.get('receiverId');
    const userId = searchParams.get('userId');

    // Cas 1: Récupérer une conversation spécifique entre deux utilisateurs
    if (senderId && receiverId) {
      const conversation = await messageService.getConversation(senderId, receiverId);
      if (conversation) {
        return NextResponse.json(conversation);
      } else {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
    }
    
    // Cas 2: Récupérer tous les messages d'un utilisateur spécifique
    else if (userId) {
      const messages = await messageService.getMessagesByUser(userId);
      return NextResponse.json(messages);
    }
    
    // Cas 3: Récupérer tous les messages (pour admin/debug)
    else if (searchParams.get('all') === 'true') {
      const messages = await messageService.getAllMessages();
      return NextResponse.json(messages);
    }
    
    // Cas 4: Récupérer tous les messages de l'utilisateur connecté (par défaut)
    else {
      const messages = await messageService.getMessagesByUser(auth.uid);
      return NextResponse.json(messages);
    }
    
  } catch (error) {
    console.error('❌ Erreur GET /api/messages:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch messages',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
