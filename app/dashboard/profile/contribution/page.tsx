'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiCreditCard, 
  FiCalendar, 
  FiCheck, 
  FiX,
  FiAlertCircle,
  FiDollarSign,
  FiClock,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';

interface Payment {
  id: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed';
  method: string;
  invoiceUrl?: string;
}

interface Subscription {
  plan: string;
  price: number;
  period: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  nextPayment: string;
  features: string[];
}

const paymentHistory: Payment[] = [
  {
    id: '1',
    amount: 29.99,
    date: '2024-01-15',
    status: 'paid',
    method: 'Carte bancaire ****1234',
    invoiceUrl: '/invoices/2024-01.pdf'
  },
  {
    id: '2',
    amount: 29.99,
    date: '2023-12-15',
    status: 'paid',
    method: 'Carte bancaire ****1234',
    invoiceUrl: '/invoices/2023-12.pdf'
  },
  {
    id: '3',
    amount: 29.99,
    date: '2023-11-15',
    status: 'paid',
    method: 'PayPal',
    invoiceUrl: '/invoices/2023-11.pdf'
  },
  {
    id: '4',
    amount: 29.99,
    date: '2023-10-15',
    status: 'failed',
    method: 'Carte bancaire ****5678'
  }
];

const currentSubscription: Subscription = {
  plan: 'Animateur Pro',
  price: 29.99,
  period: 'monthly',
  status: 'active',
  nextPayment: '2024-02-15',
  features: [
    'Laalas illimités',
    'Statistiques avancées',
    'Support prioritaire',
    'Outils de marketing',
    'API access',
    'Boutiques multiples'
  ]
};

const plans = [
  {
    name: 'Animateur Pro',
    price: 29.99,
    period: 'monthly',
    yearlyPrice: 299.99,
    features: [
      'Laalas illimités',
      'Statistiques avancées',
      'Support prioritaire',
      'Outils de marketing',
      'API access',
      'Boutiques multiples'
    ],
    current: true
  },
  {
    name: 'Animateur Premium',
    price: 49.99,
    period: 'monthly',
    yearlyPrice: 499.99,
    features: [
      'Tout du plan Pro',
      'IA pour contenu',
      'Analytics prédictifs',
      'Support 24/7',
      'Formation personnalisée',
      'Manager dédié'
    ],
    current: false
  }
];

export default function ContributionPage() {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      case 'active': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      case 'expired': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Payé';
      case 'pending': return 'En attente';
      case 'failed': return 'Échec';
      case 'active': return 'Actif';
      case 'cancelled': return 'Annulé';
      case 'expired': return 'Expiré';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <FiCheck className="w-4 h-4" />;
      case 'pending': return <FiClock className="w-4 h-4" />;
      case 'failed': return <FiX className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contribution Mensuelle</h1>
          <p className="text-gray-600 mt-1">
            Gérez votre abonnement et vos paiements
          </p>
        </div>
      </div>

      {/* Current Subscription */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Abonnement actuel</h2>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            currentSubscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <FiCheck className="w-4 h-4 mr-1" />
            {getStatusLabel(currentSubscription.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{currentSubscription.plan}</h3>
            <div className="flex items-baseline space-x-2 mb-4">
              <span className="text-3xl font-bold text-[#f01919]">{currentSubscription.price} €</span>
              <span className="text-gray-600">/ mois</span>
            </div>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <FiCalendar className="w-4 h-4 mr-2" />
                Prochain paiement: {new Date(currentSubscription.nextPayment).toLocaleDateString('fr-FR')}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FiCreditCard className="w-4 h-4 mr-2" />
                Carte bancaire ****1234
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={() => setShowPaymentModal(true)}
                className="bg-[#f01919] hover:bg-[#d01515] text-white"
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Changer de plan
              </Button>
              <Button variant="outline">
                <FiCreditCard className="w-4 h-4 mr-2" />
                Modifier paiement
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Fonctionnalités incluses:</h4>
            <ul className="space-y-2">
              {currentSubscription.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total payé cette année</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">359.88 €</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paiements réussis</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {paymentHistory.filter(p => p.status === 'paid').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <FiCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prochaine facture</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">29.99 €</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(currentSubscription.nextPayment).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiCalendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historique des paiements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Méthode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentHistory.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {new Date(payment.date).toLocaleDateString('fr-FR')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {payment.amount.toFixed(2)} €
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{payment.method}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center text-sm font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1">{getStatusLabel(payment.status)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.invoiceUrl && payment.status === 'paid' && (
                      <Button size="sm" variant="outline">
                        <FiDownload className="w-4 h-4 mr-1" />
                        Facture
                      </Button>
                    )}
                    {payment.status === 'failed' && (
                      <Button size="sm" className="bg-[#f01919] hover:bg-[#d01515] text-white">
                        <FiRefreshCw className="w-4 h-4 mr-1" />
                        Réessayer
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade Notice */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FiAlertCircle className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Passez au plan Premium et économisez !
            </h3>
            <p className="text-blue-700 mb-4">
              Obtenez 2 mois gratuits en passant à l'abonnement annuel Premium. 
              Accédez à l'IA pour la création de contenu et aux analytics prédictifs.
            </p>
            <Button 
              onClick={() => setShowPaymentModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Découvrir Premium
            </Button>
          </div>
        </div>
      </div>

      {/* Plan Selection Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Choisir un plan</h2>
            </div>
            
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedPlan('monthly')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedPlan === 'monthly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Mensuel
                  </button>
                  <button
                    onClick={() => setSelectedPlan('yearly')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedPlan === 'yearly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Annuel (2 mois gratuits)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`border-2 rounded-lg p-6 ${
                      plan.current
                        ? 'border-[#f01919] bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="flex items-baseline justify-center space-x-2">
                        <span className="text-3xl font-bold text-[#f01919]">
                          {selectedPlan === 'yearly' ? plan.yearlyPrice : plan.price} €
                        </span>
                        <span className="text-gray-600">
                          / {selectedPlan === 'yearly' ? 'an' : 'mois'}
                        </span>
                      </div>
                      {selectedPlan === 'yearly' && (
                        <p className="text-sm text-green-600 mt-1">
                          Économisez {((plan.price * 12) - plan.yearlyPrice).toFixed(2)} € par an
                        </p>
                      )}
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${
                        plan.current
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-[#f01919] hover:bg-[#d01515]'
                      } text-white`}
                      disabled={plan.current}
                    >
                      {plan.current ? 'Plan actuel' : 'Choisir ce plan'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowPaymentModal(false)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}