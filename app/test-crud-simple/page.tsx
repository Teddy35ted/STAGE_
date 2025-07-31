'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function TestCrudSimplePage() {
  const [contenus, setContenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newContenu, setNewContenu] = useState({
    nom: 'Test Contenu Simple',
    idLaala: 'test-laala-123',
    type: 'texte',
    src: '',
    allowComment: true,
    htags: ['#test'],
    personnes: []
  });

  const { user, loading: authLoading } = useAuth();
  const { apiFetch } = useApi();

  // Charger les contenus au démarrage
  useEffect(() => {
    if (user) {
      loadContenus();
    }
  }, [user]);

  const loadContenus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 Chargement des contenus...');
      const data = await apiFetch('/api/contenus');
      setContenus(data);
      console.log('✅ Contenus chargés:', data.length);
      
    } catch (err) {
      console.error('❌ Erreur chargement contenus:', err);
      setError(`Erreur chargement: ${err instanceof Error ? err.message : 'Inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const createContenu = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      console.log('➕ Création d\'un contenu...');
      console.log('📄 Données:', newContenu);
      
      const result = await apiFetch('/api/contenus', {
        method: 'POST',
        body: JSON.stringify(newContenu)
      });
      
      console.log('✅ Contenu créé:', result);
      setSuccess(`Contenu créé avec succès! ID: ${result.id}`);
      
      // Recharger la liste
      await loadContenus();
      
      // Réinitialiser le formulaire
      setNewContenu({
        ...newContenu,
        nom: `Test Contenu ${Date.now()}`
      });
      
    } catch (err) {
      console.error('❌ Erreur création contenu:', err);
      setError(`Erreur création: ${err instanceof Error ? err.message : 'Inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteContenu = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      console.log('🗑️ Suppression contenu:', id);
      
      await apiFetch(`/api/contenus/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ Contenu supprimé');
      setSuccess('Contenu supprimé avec succès!');
      
      // Recharger la liste
      await loadContenus();
      
    } catch (err) {
      console.error('❌ Erreur suppression contenu:', err);
      setError(`Erreur suppression: ${err instanceof Error ? err.message : 'Inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const ensureUser = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      console.log('👤 Vérification/Création utilisateur...');
      
      const result = await apiFetch('/api/ensure-user', {
        method: 'POST',
        body: JSON.stringify({
          nom: 'Utilisateur Test',
          prenom: 'Dashboard',
          email: user?.email || 'test@example.com'
        })
      });
      
      console.log('✅ Utilisateur vérifié/créé:', result);
      setSuccess(`Utilisateur ${result.action}: ${result.user.nom}`);
      
    } catch (err) {
      console.error('❌ Erreur ensure user:', err);
      setError(`Erreur utilisateur: ${err instanceof Error ? err.message : 'Inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="p-8">Chargement de l'authentification...</div>;
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test CRUD Simple</h1>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <p>Vous devez être connecté pour tester les opérations CRUD.</p>
          <a href="/auth" className="text-blue-600 underline">Se connecter</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Test CRUD Simple</h1>
      
      {/* Statut utilisateur */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Utilisateur Connecté</h2>
        <div>Email: {user.email}</div>
        <div>UID: {user.uid}</div>
        <Button onClick={ensureUser} disabled={loading} className="mt-2">
          {loading ? 'Vérification...' : 'Vérifier/Créer Utilisateur'}
        </Button>
      </div>

      {/* Formulaire de création */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Créer un Contenu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <Input
              value={newContenu.nom}
              onChange={(e) => setNewContenu({...newContenu, nom: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ID Laala</label>
            <Input
              value={newContenu.idLaala}
              onChange={(e) => setNewContenu({...newContenu, idLaala: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={newContenu.type}
              onChange={(e) => setNewContenu({...newContenu, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="texte">Texte</option>
              <option value="image">Image</option>
              <option value="video">Vidéo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Source (URL)</label>
            <Input
              value={newContenu.src}
              onChange={(e) => setNewContenu({...newContenu, src: e.target.value})}
              placeholder="URL optionnelle"
            />
          </div>
        </div>
        <Button onClick={createContenu} disabled={loading}>
          {loading ? 'Création...' : 'Créer Contenu'}
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h3 className="text-red-800 font-semibold">Erreur</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <h3 className="text-green-800 font-semibold">Succès</h3>
          <p className="text-green-600">{success}</p>
        </div>
      )}

      {/* Liste des contenus */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Contenus ({contenus.length})</h2>
          <Button onClick={loadContenus} disabled={loading} variant="outline">
            {loading ? 'Chargement...' : 'Recharger'}
          </Button>
        </div>
        
        {contenus.length === 0 ? (
          <p className="text-gray-500">Aucun contenu trouvé</p>
        ) : (
          <div className="space-y-2">
            {contenus.map((contenu) => (
              <div key={contenu.id} className="bg-white p-3 rounded border flex justify-between items-center">
                <div>
                  <div className="font-medium">{contenu.nom}</div>
                  <div className="text-sm text-gray-500">
                    Type: {contenu.type} | Laala: {contenu.idLaala} | ID: {contenu.id}
                  </div>
                  <div className="text-xs text-gray-400">
                    Créé le: {contenu.date} à {contenu.heure} par {contenu.nomCrea}
                  </div>
                </div>
                <Button
                  onClick={() => deleteContenu(contenu.id)}
                  disabled={loading}
                  variant="destructive"
                  size="sm"
                >
                  Supprimer
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}