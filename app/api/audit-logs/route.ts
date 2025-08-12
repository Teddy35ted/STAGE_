import { NextRequest, NextResponse } from 'next/server';
import { AuditLogService } from '../../Backend/services/collections/AuditLogService';
import { verifyAuth } from '../../Backend/utils/authVerifier';

const auditService = new AuditLogService();

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('📋 Récupération des logs d\'audit pour utilisateur:', auth.uid);
    
    const { searchParams } = new URL(request.url);
    const coGestionnaireId = searchParams.get('coGestionnaireId');
    const resource = searchParams.get('resource');
    const resourceId = searchParams.get('resourceId');
    const limit = parseInt(searchParams.get('limit') || '50');

    let logs;

    if (coGestionnaireId) {
      // Logs pour un co-gestionnaire spécifique
      logs = await auditService.getLogsByCoGestionnaire(coGestionnaireId, limit);
    } else if (resource && resourceId) {
      // Logs pour une ressource spécifique
      logs = await auditService.getLogsByResource(resource, resourceId, limit);
    } else {
      // Tous les logs pour le propriétaire
      logs = await auditService.getLogsByProprietaire(auth.uid, limit);
    }

    console.log(`✅ ${logs.length} logs d'audit récupérés`);
    
    return NextResponse.json({
      success: true,
      logs,
      count: logs.length
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération logs audit:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch audit logs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
