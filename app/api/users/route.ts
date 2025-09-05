import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../Backend/services/collections/UserService';
import { UserDashboard } from '../../models/user';
import { verifyAuth } from '../../Backend/utils/authVerifier';

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
    let id = searchParams.get('id');
    const email = searchParams.get('email');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const orderBy = searchParams.get('orderBy');
    const orderDirection = searchParams.get('orderDirection') as 'asc' | 'desc' | null;

    // Nettoyer l'ID des paramètres VSCode et autres non pertinents
    if (id && (
      id.includes('-') && id.length > 30 || // UUIDs générés par VSCode
      id.includes('vscode') ||
      id.includes('browser') ||
      id.includes('req')
    )) {
      console.log('⚠️ Paramètre ID ignoré (généré par VSCode):', id);
      id = null; // Ignorer cet ID
    }

    console.log('🔍 API Users - Paramètres de recherche:', {
      id, email, search, limit, offset, orderBy, orderDirection
    });

    // Recherche par ID spécifique (seulement si c'est un vrai ID utilisateur)
    if (id) {
      console.log('📖 Recherche utilisateur par ID:', id);
      const user = await userService.getById(id);
      if (user) {
        // Retirer le mot de passe pour la sécurité
        const { password, ...safeUser } = user;
        return NextResponse.json({ success: true, data: safeUser });
      } else {
        return NextResponse.json({ 
          success: false, 
          error: 'Utilisateur non trouvé' 
        }, { status: 404 });
      }
    }

    // Recherche par email spécifique
    if (email) {
      console.log('📧 Recherche utilisateur par email:', email);
      const user = await userService.getByEmail(email);
      if (user) {
        // Retirer le mot de passe pour la sécurité
        const { password, ...safeUser } = user;
        return NextResponse.json({ success: true, data: safeUser });
      } else {
        return NextResponse.json({ 
          success: false, 
          error: 'Utilisateur non trouvé' 
        }, { status: 404 });
      }
    }

    // Recherche avancée ou récupération de tous les utilisateurs
    const paginationOptions = {
      limit: limit ? parseInt(limit) : 50, // Limite par défaut
      offset: offset ? parseInt(offset) : 0,
      orderBy: orderBy || 'registerDate', // Utiliser registerDate au lieu de createdAt
      orderDirection: orderDirection || 'desc'
    };

    let users = [];

    if (search && search.trim() !== '') {
      console.log('🔍 Recherche avancée avec terme:', search);
      // Recherche avancée par terme
      users = await userService.searchUsers(search.trim(), paginationOptions);
    } else {
      console.log('📋 Récupération de tous les utilisateurs');
      // Récupération de tous les utilisateurs avec pagination
      users = await userService.getAll(paginationOptions);
    }

    // Retirer les mots de passe pour la sécurité
    const safeUsers = users.map((user: UserDashboard) => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    console.log(`✅ ${safeUsers.length} utilisateurs récupérés`);

    return NextResponse.json({
      success: true,
      data: safeUsers,
      pagination: {
        limit: paginationOptions.limit,
        offset: paginationOptions.offset,
        total: safeUsers.length,
        orderBy: paginationOptions.orderBy,
        orderDirection: paginationOptions.orderDirection
      }
    });

  } catch (error) {
    console.error('❌ Erreur API users GET:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la récupération des utilisateurs' 
    }, { status: 500 });
  }
}
