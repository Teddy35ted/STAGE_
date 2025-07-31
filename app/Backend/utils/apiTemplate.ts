// ===== TEMPLATE GÉNÉRIQUE POUR LES APIs [id] =====
// Template réutilisable pour les opérations CRUD individuelles

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from './authVerifier';

export interface ApiTemplateOptions {
  serviceName: string;
  resourceName: string;
  serviceInstance: any;
  checkOwnership?: boolean;
  ownershipField?: string;
  allowedOperations?: ('GET' | 'PUT' | 'DELETE')[];
}

export function createCrudApiHandlers(options: ApiTemplateOptions) {
  const {
    serviceName,
    resourceName,
    serviceInstance,
    checkOwnership = false,
    ownershipField = 'idCreateur',
    allowedOperations = ['GET', 'PUT', 'DELETE']
  } = options;

  const handlers: any = {};

  // GET - Lecture d'un élément
  if (allowedOperations.includes('GET')) {
    handlers.GET = async function(request: NextRequest, { params }: { params: { id: string } }) {
      const auth = await verifyAuth(request);
      if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      try {
        console.log(`📖 Lecture ${resourceName} ID:`, params.id);
        
        if (!params.id || params.id.trim() === '') {
          return NextResponse.json({ 
            error: 'ID manquant',
            details: 'L\'ID de la ressource est requis'
          }, { status: 400 });
        }

        const item = await serviceInstance.getById(params.id);
        
        if (!item) {
          console.log(`❌ ${resourceName} non trouvé:`, params.id);
          return NextResponse.json({ 
            error: `${resourceName} not found`,
            details: `Aucun ${resourceName} trouvé avec l'ID ${params.id}`
          }, { status: 404 });
        }

        // Vérification de propriété si nécessaire
        if (checkOwnership && item[ownershipField] !== auth.uid) {
          console.log(`❌ Permission refusée pour lecture ${resourceName}:`, params.id);
          return NextResponse.json({ 
            error: 'Permission denied',
            details: 'Vous n\'avez pas les permissions pour accéder à cette ressource'
          }, { status: 403 });
        }
        
        console.log(`✅ ${resourceName} trouvé:`, item.nom || item.contenu || item.id);
        return NextResponse.json(item);
        
      } catch (error) {
        console.error(`❌ Erreur lecture ${resourceName}:`, error);
        return NextResponse.json({ 
          error: `Failed to get ${resourceName}`,
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    };
  }

  // PUT - Mise à jour d'un élément
  if (allowedOperations.includes('PUT')) {
    handlers.PUT = async function(request: NextRequest, { params }: { params: { id: string } }) {
      const auth = await verifyAuth(request);
      if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      try {
        console.log(`✏️ Mise à jour ${resourceName} ID:`, params.id);
        
        if (!params.id || params.id.trim() === '') {
          return NextResponse.json({ 
            error: 'ID manquant',
            details: 'L\'ID de la ressource est requis'
          }, { status: 400 });
        }

        const data = await request.json();
        console.log(`📝 Données de mise à jour ${resourceName}:`, data);
        
        // Vérifier que l'élément existe
        const existingItem = await serviceInstance.getById(params.id);
        if (!existingItem) {
          console.log(`❌ ${resourceName} à modifier non trouvé:`, params.id);
          return NextResponse.json({ 
            error: `${resourceName} not found`,
            details: `Aucun ${resourceName} trouvé avec l'ID ${params.id}`
          }, { status: 404 });
        }

        // Vérification de propriété si nécessaire (mode permissif en développement)
        if (checkOwnership && process.env.NODE_ENV !== 'development') {
          if (existingItem[ownershipField] !== auth.uid) {
            console.log(`❌ Permission refusée pour modification ${resourceName}:`, params.id);
            return NextResponse.json({ 
              error: 'Permission denied',
              details: 'Vous n\'avez pas les permissions pour modifier cette ressource'
            }, { status: 403 });
          }
        }
        
        // Nettoyer les données (enlever les champs non modifiables)
        const { id, createdAt, updatedAt, ...cleanData } = data;
        
        await serviceInstance.update(params.id, cleanData);
        
        // Récupérer l'élément mis à jour
        const updatedItem = await serviceInstance.getById(params.id);
        
        console.log(`✅ ${resourceName} mis à jour:`, updatedItem?.nom || updatedItem?.contenu || updatedItem?.id);
        
        return NextResponse.json({ 
          success: true,
          message: `${resourceName} mis à jour avec succès`,
          data: updatedItem
        });
        
      } catch (error) {
        console.error(`❌ Erreur mise à jour ${resourceName}:`, error);
        return NextResponse.json({ 
          error: `Failed to update ${resourceName}`,
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    };
  }

  // DELETE - Suppression d'un élément
  if (allowedOperations.includes('DELETE')) {
    handlers.DELETE = async function(request: NextRequest, { params }: { params: { id: string } }) {
      const auth = await verifyAuth(request);
      if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      try {
        console.log(`🗑️ Suppression ${resourceName} ID:`, params.id);
        
        if (!params.id || params.id.trim() === '') {
          return NextResponse.json({ 
            error: 'ID manquant',
            details: 'L\'ID de la ressource est requis'
          }, { status: 400 });
        }
        
        // Vérifier que l'élément existe
        const existingItem = await serviceInstance.getById(params.id);
        if (!existingItem) {
          console.log(`❌ ${resourceName} à supprimer non trouvé:`, params.id);
          return NextResponse.json({ 
            error: `${resourceName} not found`,
            details: `Aucun ${resourceName} trouvé avec l'ID ${params.id}`
          }, { status: 404 });
        }

        // Vérification de propriété si nécessaire (mode permissif en développement)
        if (checkOwnership && process.env.NODE_ENV !== 'development') {
          if (existingItem[ownershipField] !== auth.uid) {
            console.log(`❌ Permission refusée pour suppression ${resourceName}:`, params.id);
            return NextResponse.json({ 
              error: 'Permission denied',
              details: 'Vous n\'avez pas les permissions pour supprimer cette ressource'
            }, { status: 403 });
          }
        }
        
        await serviceInstance.delete(params.id);
        
        console.log(`✅ ${resourceName} supprimé:`, existingItem.nom || existingItem.contenu || existingItem.id);
        
        return NextResponse.json({ 
          success: true,
          message: `${resourceName} supprimé avec succès`,
          deletedItem: {
            id: existingItem.id,
            name: existingItem.nom || existingItem.contenu || `${resourceName} ${existingItem.id}`
          }
        });
        
      } catch (error) {
        console.error(`❌ Erreur suppression ${resourceName}:`, error);
        return NextResponse.json({ 
          error: `Failed to delete ${resourceName}`,
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    };
  }

  return handlers;
}

// Fonction utilitaire pour créer rapidement des handlers CRUD
export function createQuickCrudHandlers(
  serviceName: string,
  resourceName: string,
  serviceInstance: any,
  options: Partial<ApiTemplateOptions> = {}
) {
  return createCrudApiHandlers({
    serviceName,
    resourceName,
    serviceInstance,
    checkOwnership: true,
    ownershipField: 'idCreateur',
    allowedOperations: ['GET', 'PUT', 'DELETE'],
    ...options
  });
}