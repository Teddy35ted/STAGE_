import { UserService } from '../../../Backend/services/collections/UserService';
import { createQuickCrudHandlers } from '../../../Backend/utils/apiTemplate';

const userService = new UserService();

// Utilisation du template générique avec permissions permissives
const handlers = createQuickCrudHandlers(
  'UserService',
  'user',
  userService,
  {
    checkOwnership: false, // Permissions permissives par défaut
    ownershipField: 'id',
    allowedOperations: ['GET', 'PUT'] // Pas de DELETE pour les utilisateurs
  }
);

export const GET = handlers.GET;
export const PUT = handlers.PUT;
// Pas d'export DELETE pour les utilisateurs