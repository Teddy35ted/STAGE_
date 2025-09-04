'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { EmailPreview, EmailData } from './EmailPreview';
import { FiUser, FiClock, FiCheck, FiX, FiMail, FiCalendar, FiLogOut, FiRefreshCw } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface AccountRequest {
  id: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  adminId?: string;
  adminComment?: string;
  processedDate?: string;
  temporaryPassword?: string;
  isFirstLogin: boolean;
}

interface AdminInfo {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  permissions: string[];
}

export const AdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<AccountRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AccountRequest | null>(null);
  const [comment, setComment] = useState('');
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [emailData, setEmailData] = useState<EmailData | null>(null);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const router = useRouter();

  useEffect(() => {
    fetchRequests();
    fetchAdminInfo();

    // Polling automatique toutes les 30 secondes
    const intervalId = setInterval(() => {
      console.log('🔄 Actualisation automatique des demandes...');
      fetchRequests();
    }, 30000);

    // Nettoyer l'intervalle au démontage du composant
    return () => clearInterval(intervalId);
  }, []);

  const fetchAdminInfo = () => {
    // Simuler les infos admin depuis le token
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/auth');
      return;
    }
    
    // En production, décoder le JWT pour récupérer les infos
    setAdminInfo({
      id: 'admin-1',
      email: 'admin@la-a-la.com',
      nom: 'Administrateur',
      prenom: 'Principal',
      role: 'super-admin',
      permissions: ['manage-accounts']
    });
  };

  const fetchRequests = async (isRetry = false) => {
    try {
      if (!isRetry) {
        setError(null); // Reset error state seulement si ce n'est pas un retry
      }
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.warn('⚠️ Token manquant, redirection vers auth');
        router.push('/auth');
        return;
      }

      console.log(`🔄 ${isRetry ? 'Nouvelle tentative de' : ''} Chargement des demandes...`);
      
      const response = await fetch('/api/admin/account-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-cache' // Forcer le rechargement
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Données reçues de l\'API:', data);
        console.log('📊 Nombre de demandes:', data.requests?.length || 0);
        
        setRequests(data.requests || []);
        setRetryCount(0); // Reset retry count après succès
        console.log('✅ Demandes chargées:', data.requests?.length || 0);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erreur API:', response.status, errorData);
        
        if (response.status === 401) {
          // Token invalide, rediriger vers la connexion
          console.warn('⚠️ Token expiré, redirection vers auth');
          localStorage.removeItem('adminToken');
          router.push('/auth');
          return;
        }
        
        // Afficher un message d'erreur mais ne pas bloquer l'interface
        setError(`Erreur ${response.status}: ${errorData.error || 'Erreur lors du chargement'}`);
        setRequests([]);
      }
    } catch (error: any) {
      console.error('❌ Erreur réseau:', error);
      
      // Logique de retry automatique pour les erreurs de connexion
      if ((error.message === 'Failed to fetch' || error.name === 'TypeError') && retryCount < 2) {
        console.log(`🔄 Retry automatique ${retryCount + 1}/2...`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchRequests(true), 2000); // Retry après 2 secondes
        return;
      }
      
      // Reset retry count après succès ou échec final
      setRetryCount(0);
      
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        setError('🔌 Erreur de connexion: Le serveur n\'est pas accessible. Vérifiez que http://localhost:3000 fonctionne.');
      } else {
        setError(`🌐 Erreur réseau: ${error.message}`);
      }
      
      // En cas d'erreur réseau, initialiser avec un tableau vide pour éviter les crashs
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    if (!comment.trim() && action === 'reject') {
      alert('Un commentaire est requis pour rejeter une demande');
      return;
    }

    const request = requests.find(r => r.id === requestId);
    if (!request) {
      alert('Demande introuvable');
      return;
    }

    // Préparer les données pour la prévisualisation
    const tempPassword = action === 'approve' ? generateTemporaryPassword() : undefined;
    
    const emailDataToPreview: EmailData = {
      type: action,
      to: request.email,
      subject: action === 'approve' 
        ? 'Demande de compte approuvée - La-a-La'
        : 'Demande de compte refusée - La-a-La',
      comment: comment.trim(),
      temporaryPassword: tempPassword,
      adminEmail: adminInfo?.email || 'admin@la-a-la.com'
    };

    setEmailData(emailDataToPreview);
    setPendingAction(action);
    setShowEmailPreview(true);
  };

  const generateTemporaryPassword = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSendEmail = async (finalEmailData: EmailData) => {
    if (!selectedRequest || !pendingAction) return;

    setProcessingId(selectedRequest.id);
    setShowEmailPreview(false);

    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = pendingAction === 'approve' 
        ? '/api/admin/account-requests/approve'
        : '/api/admin/account-requests/reject';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          comment: finalEmailData.comment,
          temporaryPassword: finalEmailData.temporaryPassword,
          customSubject: finalEmailData.subject,
          customAdminEmail: finalEmailData.adminEmail
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Rafraîchir la liste
        await fetchRequests();
        setSelectedRequest(null);
        setComment('');
        setPendingAction(null);
        setEmailData(null);
        
        if (pendingAction === 'approve') {
          alert(`✅ Demande approuvée avec succès !\n\n📧 Un email avec le mot de passe temporaire a été envoyé à l'utilisateur.\n\n🔑 Mot de passe généré : ${finalEmailData.temporaryPassword}`);
        } else {
          alert(`✅ Demande rejetée avec succès !\n\n📧 Un email de notification a été envoyé à l'utilisateur.`);
        }
      } else {
        alert(`❌ Erreur : ${data.error}`);
      }
    } catch (error) {
      console.error('Erreur traitement demande:', error);
      alert('❌ Erreur lors du traitement de la demande');
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/auth');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejetée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Fonction pour renvoyer l'email d'approbation
  const handleResendEmail = async (request: AccountRequest) => {
    if (!request.temporaryPassword) {
      alert('Aucun mot de passe temporaire trouvé pour cette demande');
      return;
    }

    setProcessingId(request.id);
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/account-requests/resend-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId: request.id,
          email: request.email,
          temporaryPassword: request.temporaryPassword
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Email d'approbation renvoyé avec succès à ${request.email}`);
      } else {
        alert(`❌ Erreur : ${data.error}`);
      }
    } catch (error) {
      console.error('Erreur renvoi email:', error);
      alert('❌ Erreur lors du renvoi de l\'email');
    } finally {
      setProcessingId(null);
    }
  };

  // Fonction pour renvoyer l'email de rejet
  const handleResendRejectionEmail = async (request: AccountRequest) => {
    setProcessingId(request.id);
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/account-requests/resend-rejection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId: request.id,
          email: request.email,
          comment: request.adminComment || 'Votre demande de compte a été rejetée.'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Email de rejet renvoyé avec succès à ${request.email}`);
      } else {
        alert(`❌ Erreur : ${data.error}`);
      }
    } catch (error) {
      console.error('Erreur renvoi email rejet:', error);
      alert('❌ Erreur lors du renvoi de l\'email');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Administration Laala</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {adminInfo && (
                <div className="text-sm text-gray-700">
                  Connecté en tant que <span className="font-medium">{adminInfo.prenom} {adminInfo.nom}</span>
                </div>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FiLogOut className="w-4 h-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <FiX className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <Button 
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    fetchRequests();
                  }}
                  variant="outline" 
                  size="sm"
                  className="mt-2 text-red-700 border-red-300 hover:bg-red-50"
                >
                  Réessayer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Section de test pour créer des demandes */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-blue-800 font-medium mb-2">🧪 Zone de Test</h3>
          <p className="text-blue-700 text-sm mb-3">Créer une demande de test pour vérifier le système</p>
          <div className="flex gap-2">
            <Button 
              onClick={async () => {
                try {
                  const response = await fetch('/api/auth/request-account', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: `test.${Date.now()}@example.com` })
                  });
                  if (response.ok) {
                    await fetchRequests(); // Recharger les demandes
                  }
                } catch (err) {
                  console.error('Erreur création demande test:', err);
                }
              }}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Créer demande test
            </Button>
            <Button 
              onClick={() => fetchRequests()}
              variant="outline"
              size="sm"
            >
              Actualiser
            </Button>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demandes en attente</CardTitle>
              <FiClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {requests.filter(r => r.status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demandes approuvées</CardTitle>
              <FiCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {requests.filter(r => r.status === 'approved').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total des demandes</CardTitle>
              <FiUser className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Indicateur de retry */}
        {retryCount > 0 && !error && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin">🔄</div>
              <span className="text-blue-700 text-sm">
                Reconnexion en cours... (tentative {retryCount}/2)
              </span>
            </div>
          </div>
        )}

        {/* Affichage d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-red-600">⚠️</div>
              <div className="flex-1">
                <h3 className="text-red-800 font-medium">Erreur de connexion</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={() => {
                      setError(null);
                      setRetryCount(0);
                      fetchRequests();
                    }}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Réessayer
                  </button>
                  <button 
                    onClick={() => {
                      // Forcer le rechargement de la page pour vider le cache
                      window.location.reload();
                    }}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Recharger la page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Demandes de création de compte</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune demande de compte pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <FiMail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{request.email}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <FiCalendar className="w-4 h-4" />
                              <span>Demandé: {formatDate(request.requestDate)}</span>
                            </div>
                            {request.processedDate && (
                              <div className="flex items-center gap-1">
                                <FiCheck className="w-4 h-4" />
                                <span>Traité: {formatDate(request.processedDate)}</span>
                              </div>
                            )}
                            {request.adminComment && (
                              <div className="text-blue-600 text-xs">
                                💬 Commentaire admin disponible
                              </div>
                            )}
                          </div>
                          {request.adminComment && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                              <strong>Commentaire admin:</strong> {request.adminComment}
                            </div>
                          )}
                          {request.temporaryPassword && request.status === 'approved' && (
                            <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-800">
                              <strong>Mot de passe temporaire:</strong> 
                              <code className="ml-2 bg-green-100 px-2 py-1 rounded">{request.temporaryPassword}</code>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(request.status)}
                      
                      {/* Actions pour demandes en attente */}
                      {request.status === 'pending' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              Traiter
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Traiter la demande de {request.email}</DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Commentaire (optionnel pour approbation, requis pour rejet)</label>
                                <Textarea
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  placeholder="Commentaire administrateur..."
                                  className="mt-1"
                                />
                              </div>
                              
                              <div className="flex gap-3">
                                <Button
                                  onClick={() => handleRequestAction(request.id, 'approve')}
                                  disabled={processingId === request.id}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  <FiCheck className="w-4 h-4 mr-2" />
                                  {processingId === request.id ? 'Traitement...' : 'Approuver'}
                                </Button>
                                
                                <Button
                                  onClick={() => handleRequestAction(request.id, 'reject')}
                                  disabled={processingId === request.id}
                                  variant="destructive"
                                  className="flex-1"
                                >
                                  <FiX className="w-4 h-4 mr-2" />
                                  {processingId === request.id ? 'Traitement...' : 'Rejeter'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {/* Actions pour demandes approuvées */}
                      {request.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendEmail(request)}
                          disabled={processingId === request.id}
                        >
                          <FiMail className="w-4 h-4 mr-2" />
                          Renvoyer email
                        </Button>
                      )}

                      {/* Actions pour demandes rejetées */}
                      {request.status === 'rejected' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResendRejectionEmail(request)}
                            disabled={processingId === request.id}
                          >
                            <FiMail className="w-4 h-4 mr-2" />
                            Renvoyer email rejet
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              // Réouvrir pour retraitement
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <FiRefreshCw className="w-4 h-4 mr-2" />
                            Retraiter
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Prévisualisation d'email */}
      {showEmailPreview && emailData && (
        <EmailPreview
          isOpen={showEmailPreview}
          onClose={() => {
            setShowEmailPreview(false);
            setEmailData(null);
            setPendingAction(null);
          }}
          onSend={handleSendEmail}
          emailData={emailData}
          onEmailDataChange={setEmailData}
        />
      )}
    </div>
  );
};
