// Script pour créer le premier administrateur
import { AdminService } from '../app/Backend/services/collections/AdminService';
import { AdminPermission } from '../app/models/admin';

const adminService = new AdminService();

async function createFirstAdmin() {
  console.log('🔧 Création du premier administrateur...');
  
  try {
    // Vérifier s'il existe déjà des administrateurs
    const existingAdmins = await adminService.getActiveAdmins();
    if (existingAdmins.length > 0) {
      console.log('❌ Des administrateurs existent déjà');
      return;
    }

    // Créer le premier admin
    const adminData = {
      email: 'tedkouevi701@gmail.com',
      nom: 'Kouevi',
      prenom: 'Ted',
      password: 'feiderus', // Mot de passe fourni
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

    const adminId = await adminService.createAdmin(adminData);
    
    console.log('✅ Premier administrateur créé avec succès');
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`🔑 Mot de passe: ${adminData.password}`);
    console.log('⚠️  CHANGEZ CE MOT DE PASSE IMMÉDIATEMENT APRÈS LA PREMIÈRE CONNEXION');
    console.log(`🆔 ID Admin: ${adminId}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  createFirstAdmin().then(() => process.exit(0));
}

export { createFirstAdmin };
