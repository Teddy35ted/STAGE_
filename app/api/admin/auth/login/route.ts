// API pour l'authentification des administrateurs
import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '../../../../Backend/services/collections/AdminService';
import { AdminPermission } from '../../../../models/admin';
import jwt from 'jsonwebtoken';

const adminService = new AdminService();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation de base
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email et mot de passe requis'
      }, { status: 400 });
    }

    // Auto-création de l'admin par défaut si aucun admin n'existe
    const hasAdmins = await adminService.hasAnyAdmins();
    if (!hasAdmins && email === 'tedkouevi701@gmail.com' && password === 'feiderus') {
      console.log('🚀 Auto-création admin par défaut...');
      
      const adminData = {
        email: 'tedkouevi701@gmail.com',
        nom: 'Kouevi',
        prenom: 'Ted',
        password: 'feiderus',
        role: 'super-admin' as const,
        permissions: [
          'manage-accounts',
          'manage-users', 
          'manage-admins',
          'view-analytics',
          'manage-content',
          'manage-payments'
        ] as AdminPermission[]
      };

      try {
        await adminService.createAdmin(adminData);
        console.log('✅ Admin par défaut créé automatiquement');
      } catch (createError) {
        console.error('❌ Erreur création admin auto:', createError);
      }
    }

    // Vérifier les identifiants
    const admin = await adminService.verifyCredentials(email, password);
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Identifiants invalides'
      }, { status: 401 });
    }

    // Générer un token JWT pour l'admin
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        email: admin.email, 
        role: admin.role,
        permissions: admin.permissions 
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '8h' }
    );

    return NextResponse.json({
      success: true,
      message: 'Connexion administrateur réussie',
      admin: {
        id: admin.id,
        email: admin.email,
        nom: admin.nom,
        prenom: admin.prenom,
        role: admin.role,
        permissions: admin.permissions
      },
      token
    });

  } catch (error: any) {
    console.error('❌ Erreur connexion admin:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la connexion'
    }, { status: 500 });
  }
}
