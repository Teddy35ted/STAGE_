import { CoGestionnaireService } from '../../../Backend/services/collections/CoGestionnaireService';
import { createQuickCrudHandlers } from '../../../Backend/utils/apiTemplate';

const coGestionnaireService = new CoGestionnaireService();

// Utilisation du template générique avec permissions permissives
const handlers = createQuickCrudHandlers(
  'CoGestionnaireService',
  'co-gestionnaire',
  coGestionnaireService,
  {
    checkOwnership: false, // Permissions permissives par défaut
    ownershipField: 'idProprietaire',
    allowedOperations: ['GET', 'PUT', 'DELETE']
  }
);

export const GET = handlers.GET;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;