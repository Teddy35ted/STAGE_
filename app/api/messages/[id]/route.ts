import { MessageService } from '../../../Backend/services/collections/MessageService';
import { createQuickCrudHandlers } from '../../../Backend/utils/apiTemplate';

const messageService = new MessageService();

// Utilisation du template générique avec permissions permissives
const handlers = createQuickCrudHandlers(
  'MessageService',
  'message',
  messageService,
  {
    checkOwnership: false, // Permissions permissives par défaut
    ownershipField: 'idExpediteur',
    allowedOperations: ['GET', 'PUT', 'DELETE']
  }
);

export const GET = handlers.GET;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;