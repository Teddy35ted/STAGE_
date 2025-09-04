// Script pour initialiser le premier administrateur
import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '../../../Backend/services/collections/AdminService';
import { AdminPermission } from '../../../models/admin';

const adminService = new AdminService();

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Tentative de création de l\'administrateur...');
    
    // Récupérer les données du corps de la requête
    const body = await request.json();
    console.log('📧 Email reçu:', body.email);
    
    // Utiliser les données de la requête ou les valeurs par défaut
    const adminData = {
      email: body.email || 'tedkouevi701@gmail.com',
      nom: body.nom || body.name || 'Kouevi',
      prenom: body.prenom || 'Ted',
      password: body.password || 'feiderus',
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

    console.log('🎯 Tentative de création avec l\'email:', adminData.email);
    
    // Créer l'admin directement sans vérification préalable complexe
    const adminId = await adminService.createAdmin(adminData);
    
    console.log('✅ Admin créé avec l\'ID:', adminId);
    
    return NextResponse.json({
      success: true,
      message: 'Administrateur créé avec succès',
      admin: {
        id: adminId,
        email: adminData.email,
        temporaryPassword: adminData.password
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
    
    // Si l'erreur indique que l'admin existe déjà, c'est OK
    if (error.message?.includes('already exists') || 
        error.message?.includes('déjà existe') ||
        error.code === 'auth/email-already-exists') {
      return NextResponse.json({
        success: true,
        message: 'Administrateur existe déjà ou créé avec succès',
        admin: {
          email: 'tedkouevi701@gmail.com'
        }
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création de l\'administrateur',
      details: error.message
    }, { status: 500 });
  }
}
