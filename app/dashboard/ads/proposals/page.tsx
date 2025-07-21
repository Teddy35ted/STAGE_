'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiTarget, 
  FiDollarSign, 
  FiEye, 
  FiUsers,
  FiCalendar,
  FiCheck,
  FiX,
  FiClock,
  FiFilter,
  FiStar,
  FiTrendingUp,
  FiBarChart
} from 'react-icons/fi';

interface AdProposal {
  id: string;
  advertiser: {
    name: string;
    logo?: string;
    rating: number;
    verified: boolean;
  };
  campaign: {
    title: string;
    description: string;
    category: string;
    budget: number;
    duration: number; // en jours
    startDate: string;
    endDate: string;
  };
  targeting: {
    audience: string;
    demographics: string[];
    interests: string[];
    estimatedReach: number;
  };
  compensation: {
    type: 'cpm' | 'cpc' | 'flat_rate' | 'commission';
    amount: number;
    estimatedEarnings: number;
    paymentTerms: string;
  };
  requirements: {
    contentType: string[];
    placements: string[];
    guidelines: string[];
    deliverables: string[];
  };
  status: 'new' | 'reviewing' | 'accepted' | 'rejected' | 'expired';
  receivedAt: string;
  expiresAt: string;
  priority: 'low' | 'medium' | 'high';
  compatibility: number; // score de compatibilité sur 100
}

const proposalsData: AdProposal[] = [
  {
    id: '1',
    advertiser: {
      name: 'BioGlow Cosmetics',
      rating: 4.8,
      verified: true
    },
    campaign: {
      title: 'Lancement Gamme Printemps Bio',
      description: 'Promotion de notre nouvelle gamme de cosmétiques bio pour le printemps',
      category: 'Beauté & Bien-être',
      budget: 15000,
      duration: 30,
      startDate: '2024-02-01',
      endDate: '2024-03-01'
    },
    targeting: {
      audience: 'Femmes 25-45 ans intéressées par la beauté naturelle',
      demographics: ['Femmes', '25-45 ans', 'France'],
      interests: ['Beauté', 'Bio', 'Lifestyle', 'Bien-être'],
      estimatedReach: 45000
    },
    compensation: {
      type: 'cpm',
      amount: 8.50,
      estimatedEarnings: 1200,
      paymentTerms: 'Paiement sous 30 jours'
    },
    requirements: {
      contentType: ['Post sponsorisé', 'Story', 'Vidéo courte'],
      placements: ['Feed principal', 'Stories'],
      guidelines: ['Mention #ad obligatoire', 'Ton authentique', 'Pas de concurrents'],
      deliverables: ['3 posts', '5 stories', '1 vidéo']
    },
    status: 'new',
    receivedAt: '2024-01-15T10:30:00Z',
    expiresAt: '2024-01-22T23:59:00Z',
    priority: 'high',
    compatibility: 92
  },
  {
    id: '2',
    advertiser: {
      name: 'FitGear Pro',
      rating: 4.6,
      verified: true
    },
    campaign: {
      title: 'Collection Fitness Hiver',
      description: 'Mise en avant de notre équipement fitness pour l\'entraînement en intérieur',
      category: 'Sport & Fitness',
      budget: 8000,
      duration: 21,
      startDate: '2024-01-25',
      endDate: '2024-02-15'
    },
    targeting: {
      audience: 'Passionnés de fitness et sport en salle',
      demographics: ['Hommes et Femmes', '20-40 ans', 'France, Belgique'],
      interests: ['Fitness', 'Musculation', 'Sport', 'Santé'],
      estimatedReach: 28000
    },
    compensation: {
      type: 'flat_rate',
      amount: 800,
      estimatedEarnings: 800,
      paymentTerms: 'Paiement à la livraison'
    },
    requirements: {
      contentType: ['Vidéo démo', 'Post photo'],
      placements: ['Feed principal', 'IGTV'],
      guidelines: ['Démonstration produit', 'Avis authentique', 'Hashtags fournis'],
      deliverables: ['2 vidéos', '3 posts photo']
    },
    status: 'reviewing',
    receivedAt: '2024-01-14T14:20:00Z',
    expiresAt: '2024-01-21T23:59:00Z',
    priority: 'medium',
    compatibility: 85
  },
  {
    id: '3',
    advertiser: {
      name: 'TechStart Academy',
      rating: 4.3,
      verified: false
    },
    campaign: {
      title: 'Formation Développement Web',
      description: 'Promotion de nos formations en ligne pour développeurs',
      category: 'Éducation & Tech',
      budget: 5000,
      duration: 14,
      startDate: '2024-02-05',
      endDate: '2024-02-19'
    },
    targeting: {
      audience: 'Professionnels tech et étudiants en reconversion',
      demographics: ['Hommes et Femmes', '22-35 ans', 'France'],
      interests: ['Technologie', 'Programmation', 'Formation', 'Carrière'],
      estimatedReach: 15000
    },
    compensation: {
      type: 'commission',
      amount: 15, // pourcentage
      estimatedEarnings: 450,
      paymentTerms: 'Commission sur ventes générées'
    },
    requirements: {
      contentType: ['Article de blog', 'Post LinkedIn'],
      placements: ['Blog', 'LinkedIn', 'Newsletter'],
      guidelines: ['Contenu éducatif', 'Expérience personnelle', 'Call-to-action clair'],
      deliverables: ['1 article', '3 posts LinkedIn']
    },
    status: 'new',
    receivedAt: '2024-01-13T16:45:00Z',
    expiresAt: '2024-01-20T23:59:00Z',
    priority: 'low',
    compatibility: 78
  },
  {
    id: '4',
    advertiser: {
      name: 'EcoHome Solutions',
      rating: 4.7,
      verified: true
    },
    campaign: {
      title: 'Maison Écologique 2024',
      description: 'Solutions durables pour un habitat respectueux de l\'environnement',
      category: 'Maison & Écologie',
      budget: 12000,
      duration: 45,
      startDate: '2024-02-10',
      endDate: '2024-03-25'
    },
    targeting: {
      audience: 'Propriétaires soucieux de l\'environnement',
      demographics: ['Hommes et Femmes', '30-55 ans', 'France'],
      interests: ['Écologie', 'Maison', 'Durabilité', 'DIY'],
      estimatedReach: 35000
    },
    compensation: {
      type: 'cpc',
      amount: 1.20,
      estimatedEarnings: 960,
      paymentTerms: 'Paiement mensuel'
    },
    requirements: {
      contentType: ['Tutoriel vidéo', 'Post Instagram', 'Story'],
      placements: ['YouTube', 'Instagram', 'Blog'],
      guidelines: ['Focus écologie', 'Avant/après', 'Tips pratiques'],
      deliverables: ['2 vidéos', '4 posts', '6 stories']
    },
    status: 'accepted',
    receivedAt: '2024-01-12T09:15:00Z',
    expiresAt: '2024-01-19T23:59:00Z',
    priority: 'high',
    compatibility: 88
  }
];

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<AdProposal[]>(proposalsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'receivedAt' | 'estimatedEarnings' | 'compatibility'>('receivedAt');

  const filteredProposals = proposals
    .filter(proposal => {
      const matchesSearch = proposal.campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           proposal.advertiser.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || proposal.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || proposal.campaign.category === filterCategory;
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'receivedAt') {
        return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
      } else if (sortBy === 'estimatedEarnings') {
        return b.compensation.estimatedEarnings - a.compensation.estimatedEarnings;
      } else {
        return b.compatibility - a.compatibility;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Nouveau';
      case 'reviewing': return 'En révision';
      case 'accepted': return 'Accepté';
      case 'rejected': return 'Refusé';
      case 'expired': return 'Expiré';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const categories = Array.from(new Set(proposals.map(p => p.campaign.category)));
  const totalEstimatedEarnings = filteredProposals.reduce((sum, p) => sum + p.compensation.estimatedEarnings, 0);
  const newProposals = proposals.filter(p => p.status === 'new').length;
  const averageCompatibility = filteredProposals.reduce((sum, p) => sum + p.compatibility, 0) / filteredProposals.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelles Propositions</h1>
          <p className="text-gray-600 mt-1">
            Découvrez les nouvelles opportunités publicitaires qui vous correspondent
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nouvelles Propositions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{newProposals}</p>
              <p className="text-sm text-blue-600 mt-1">À examiner</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiTarget className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Potentiels</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalEstimatedEarnings)}</p>
              <p className="text-sm text-green-600 mt-1">Estimés</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Compatibilité Moyenne</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{averageCompatibility.toFixed(0)}%</p>
              <p className="text-sm text-purple-600 mt-1">Score global</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiBarChart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Portée Totale</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {filteredProposals.reduce((sum, p) => sum + p.targeting.estimatedReach, 0).toLocaleString()}
              </p>
              <p className="text-sm text-blue-600 mt-1">Audience potentielle</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Rechercher une proposition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Tous les statuts</option>
              <option value="new">Nouveau</option>
              <option value="reviewing">En révision</option>
              <option value="accepted">Accepté</option>
              <option value="rejected">Refusé</option>
              <option value="expired">Expiré</option>
            </select>
          </div>
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
            >
              <option value="receivedAt">Plus récentes</option>
              <option value="estimatedEarnings">Plus rentables</option>
              <option value="compatibility">Plus compatibles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-6">
        {filteredProposals.map((proposal) => (
          <div key={proposal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{proposal.campaign.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)}`}>
                    {getStatusLabel(proposal.status)}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(proposal.priority)}`}>
                    {proposal.priority}
                  </span>
                  {proposal.advertiser.verified && (
                    <FiCheck className="w-4 h-4 text-green-500" title="Annonceur vérifié" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{proposal.campaign.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>🏢 {proposal.advertiser.name}</span>
                  <span>⭐ {proposal.advertiser.rating}/5</span>
                  <span>📅 {formatDate(proposal.campaign.startDate)} - {formatDate(proposal.campaign.endDate)}</span>
                  <span>👥 {proposal.targeting.estimatedReach.toLocaleString()} personnes</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(proposal.compensation.estimatedEarnings)}</p>
                <p className="text-sm text-gray-500">Revenus estimés</p>
                <div className={`text-sm font-medium mt-1 ${getCompatibilityColor(proposal.compatibility)}`}>
                  {proposal.compatibility}% compatible
                </div>
              </div>
            </div>

            {/* Campaign Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Compensation</h4>
                <div className="text-sm text-gray-600">
                  <p>Type: {proposal.compensation.type.toUpperCase()}</p>
                  <p>Montant: {proposal.compensation.type === 'commission' ? `${proposal.compensation.amount}%` : formatCurrency(proposal.compensation.amount)}</p>
                  <p>Paiement: {proposal.compensation.paymentTerms}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Audience cible</h4>
                <div className="text-sm text-gray-600">
                  <p>{proposal.targeting.audience}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {proposal.targeting.interests.slice(0, 3).map((interest, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Livrables</h4>
                <div className="text-sm text-gray-600">
                  {proposal.requirements.deliverables.slice(0, 3).map((deliverable, index) => (
                    <p key={index}>• {deliverable}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                {proposal.status === 'new' && (
                  <>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      <FiCheck className="w-4 h-4 mr-1" />
                      Accepter
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <FiX className="w-4 h-4 mr-1" />
                      Refuser
                    </Button>
                  </>
                )}
                <Button size="sm" variant="outline">
                  <FiEye className="w-4 h-4 mr-1" />
                  Voir détails
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                {getDaysUntilExpiry(proposal.expiresAt) > 0 ? (
                  <span>Expire dans {getDaysUntilExpiry(proposal.expiresAt)} jour(s)</span>
                ) : (
                  <span className="text-red-600">Expiré</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProposals.length === 0 && (
        <div className="text-center py-12">
          <FiTarget className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune proposition trouvée</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
              ? 'Aucune proposition ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas de nouvelles propositions publicitaires.'
            }
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FiTrendingUp className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Conseils pour optimiser vos propositions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <p className="font-medium mb-1">Sélection intelligente</p>
                <ul className="space-y-1">
                  <li>• Privilégiez les annonceurs vérifiés</li>
                  <li>• Vérifiez la compatibilité avec votre audience</li>
                  <li>• Analysez les termes de paiement</li>
                  <li>• Respectez les délais d'expiration</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Maximiser les revenus</p>
                <ul className="space-y-1">
                  <li>• Négociez les tarifs si possible</li>
                  <li>• Proposez des packages multi-plateformes</li>
                  <li>• Mettez en avant vos statistiques</li>
                  <li>• Maintenez un contenu de qualité</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}