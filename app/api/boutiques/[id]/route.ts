import { BoutiqueService } from '../../../Backend/services/collections/BoutiqueService';
import { createQuickCrudHandlers } from '../../../Backend/utils/apiTemplate';

const boutiqueService = new BoutiqueService();

// Utilisation du template générique avec permissions permissives
const handlers = createQuickCrudHandlers(
  'BoutiqueService',
  'boutique',
  boutiqueService,
  {
    checkOwnership: false, // Permissions permissives par défaut
    ownershipField: 'idProprietaire',
    allowedOperations: ['GET', 'PUT', 'DELETE']
  }
);

export const GET = handlers.GET;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;