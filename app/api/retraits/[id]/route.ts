import { RetraitService } from '../../../Backend/services/collections/RetraitService';
import { createQuickCrudHandlers } from '../../../Backend/utils/apiTemplate';

const retraitService = new RetraitService();

// Utilisation du template générique avec permissions permissives
const handlers = createQuickCrudHandlers(
  'RetraitService',
  'retrait',
  retraitService,
  {
    checkOwnership: false, // Permissions permissives par défaut
    ownershipField: 'idUtilisateur',
    allowedOperations: ['GET', 'PUT', 'DELETE']
  }
);

export const GET = handlers.GET;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;