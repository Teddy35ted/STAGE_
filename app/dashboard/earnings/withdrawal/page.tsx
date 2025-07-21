'use client';

import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  FiDollarSign, 
  FiCreditCard, 
  FiHome, 
  FiCheck,
  FiClock,
  FiX,
  FiAlertCircle,
  FiInfo,
  FiCalendar,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';

interface WithdrawalRequest {
  id: string;
  amount: number;
  method: 'bank' | 'paypal' | 'stripe';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  fees: number;
  netAmount: number;
  reference: string;
  reason?: string;
}

interface PaymentMethod {
  id: string;
  type: 'bank' | 'paypal' | 'stripe';
  name: string;
  details: string;
  isDefault: boolean;
  isVerified: boolean;
  fees: number; // percentage
  processingTime: string;
}

const withdrawalHistory: WithdrawalRequest[] = [
  {
    id: '1',
    amount: 250.00,
    method: 'bank',
    status: 'completed',
    requestedAt: '2024-01-10T14:30:00Z',
    processedAt: '2024-01-12T09:15:00Z',
    fees: 2.50,
    netAmount: 247.50,
    reference: 'WD-2024-001'
  },
  {
    id: '2',
    amount: 150.00,
    method: 'paypal',
    status: 'processing',
    requestedAt: '2024-01-14T16:20:00Z',
    fees: 4.50,
    netAmount: 145.50,
    reference: 'WD-2024-002'
  },
  {
    id: '3',
    amount: 75.00,
    method: 'stripe',
    status: 'pending',
    requestedAt: '2024-01-15T10:45:00Z',
    fees: 2.25,
    netAmount: 72.75,
    reference: 'WD-2024-003'
  },
  {
    id: '4',
    amount: 300.00,
    method: 'bank',
    status: 'rejected',
    requestedAt: '2024-01-08T11:00:00Z',
    processedAt: '2024-01-09T14:30:00Z',
    fees: 3.00,
    netAmount: 297.00,
    reference: 'WD-2024-004',
    reason: 'Informations bancaires incorrectes'
  }
];

const paymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'bank',
    name: 'Compte Bancaire Principal',
    details: 'Crédit Agricole - ****1234',
    isDefault: true,
    isVerified: true,
    fees: 1.0,
    processingTime: '2-3 jours ouvrables'
  },
  {
    id: '2',
    type: 'paypal',
    name: 'PayPal',
    details: 'marie.dubois@email.com',
    isDefault: false,
    isVerified: true,
    fees: 3.0,
    processingTime: '24-48 heures'
  },
  {
    id: '3',
    type: 'stripe',
    name: 'Stripe Express',
    details: 'Compte Stripe vérifié',
    isDefault: false,
    isVerified: false,
    fees: 3.0,
    processingTime: '1-2 jours ouvrables'
  }
];

export default function WithdrawalPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(withdrawalHistory);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Mock available balance
  const availableBalance = 425.75;
  const minimumWithdrawal = 25.00;
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending' || w.status === 'processing');
  const totalPending = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'processing': return 'En cours';
      case 'completed': return 'Terminé';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <FiClock className="w-4 h-4" />;
      case 'processing': return <FiRefreshCw className="w-4 h-4" />;
      case 'completed': return <FiCheck className="w-4 h-4" />;
      case 'rejected': return <FiX className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'bank': return <FiHome className="w-5 h-5" />;
      case 'paypal': return <FiCreditCard className="w-5 h-5" />;
      case 'stripe': return <FiCreditCard className="w-5 h-5" />;
      default: return <FiDollarSign className="w-5 h-5" />;
    }
  };

  const calculateFees = (amount: number, methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    return method ? (amount * method.fees) / 100 : 0;
  };

  const handleWithdrawal = () => {
    const amount = parseFloat(withdrawalAmount);
    const method = paymentMethods.find(m => m.id === selectedMethod);
    
    if (!method || amount < minimumWithdrawal || amount > availableBalance) {
      return;
    }

    const fees = calculateFees(amount, selectedMethod);
    const newWithdrawal: WithdrawalRequest = {
      id: Date.now().toString(),
      amount,
      method: method.type,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      fees,
      netAmount: amount - fees,
      reference: `WD-2024-${String(withdrawals.length + 1).padStart(3, '0')}`
    };

    setWithdrawals([newWithdrawal, ...withdrawals]);
    setShowWithdrawModal(false);
    setWithdrawalAmount('');
    setSelectedMethod('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Demander un Retrait</h1>
          <p className="text-gray-600 mt-1">
            Retirez vos gains vers vos comptes de paiement
          </p>
        </div>
        <Button 
          onClick={() => setShowWithdrawModal(true)}
          disabled={availableBalance < minimumWithdrawal}
          className="bg-[#f01919] hover:bg-[#d01515] text-white"
        >
          <FiDollarSign className="w-4 h-4 mr-2" />
          Nouveau retrait
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Solde Disponible</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(availableBalance)}</p>
              <p className="text-sm text-green-600 mt-1">Prêt à retirer</p>
            </div>
            <div className="p-3 rounded-lg bg-[#f01919]">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Retraits en Cours</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalPending)}</p>
              <p className="text-sm text-blue-600 mt-1">{pendingWithdrawals.length} demandes</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <FiClock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Retrait Minimum</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(minimumWithdrawal)}</p>
              <p className="text-sm text-purple-600 mt-1">Montant requis</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <FiInfo className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Méthodes de Paiement</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`p-4 border-2 rounded-lg ${
                method.isDefault ? 'border-[#f01919] bg-red-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${method.isDefault ? 'bg-[#f01919]' : 'bg-gray-100'}`}>
                    {getMethodIcon(method.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-600">{method.details}</p>
                  </div>
                </div>
                {method.isVerified ? (
                  <FiCheck className="w-5 h-5 text-green-500" />
                ) : (
                  <FiAlertCircle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Frais:</span>
                  <span>{method.fees}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Délai:</span>
                  <span>{method.processingTime}</span>
                </div>
              </div>

              {method.isDefault && (
                <div className="mt-3 text-xs text-[#f01919] font-medium">
                  Méthode par défaut
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Withdrawal History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historique des Retraits</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
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
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{withdrawal.reference}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <p className="font-medium">{formatCurrency(withdrawal.amount)}</p>
                      <p className="text-xs text-gray-500">
                        Net: {formatCurrency(withdrawal.netAmount)} (frais: {formatCurrency(withdrawal.fees)})
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getMethodIcon(withdrawal.method)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">{withdrawal.method}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                      {getStatusIcon(withdrawal.status)}
                      <span className="ml-1">{getStatusLabel(withdrawal.status)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <p>Demandé: {formatDate(withdrawal.requestedAt)}</p>
                      {withdrawal.processedAt && (
                        <p className="text-xs text-gray-500">
                          Traité: {formatDate(withdrawal.processedAt)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {withdrawal.status === 'completed' && (
                        <Button size="sm" variant="outline">
                          <FiDownload className="w-4 h-4" />
                        </Button>
                      )}
                      {withdrawal.status === 'pending' && (
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          Annuler
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Nouveau Retrait</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant à retirer
                </label>
                <Input
                  type="number"
                  placeholder={`Minimum ${minimumWithdrawal}€`}
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  min={minimumWithdrawal}
                  max={availableBalance}
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Solde disponible: {formatCurrency(availableBalance)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Méthode de paiement
                </label>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f01919]"
                >
                  <option value="">Sélectionner une méthode</option>
                  {paymentMethods.filter(m => m.isVerified).map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name} (frais: {method.fees}%)
                    </option>
                  ))}
                </select>
              </div>

              {selectedMethod && withdrawalAmount && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Montant demandé:</span>
                    <span>{formatCurrency(parseFloat(withdrawalAmount) || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Frais:</span>
                    <span>-{formatCurrency(calculateFees(parseFloat(withdrawalAmount) || 0, selectedMethod))}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium border-t border-gray-200 pt-2 mt-2">
                    <span>Montant net:</span>
                    <span>{formatCurrency((parseFloat(withdrawalAmount) || 0) - calculateFees(parseFloat(withdrawalAmount) || 0, selectedMethod))}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowWithdrawModal(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleWithdrawal}
                disabled={!selectedMethod || !withdrawalAmount || parseFloat(withdrawalAmount) < minimumWithdrawal}
                className="bg-[#f01919] hover:bg-[#d01515] text-white"
              >
                Confirmer le retrait
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FiInfo className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Informations importantes</p>
            <ul className="space-y-1 text-xs">
              <li>• Les retraits sont traités du lundi au vendredi</li>
              <li>• Un email de confirmation vous sera envoyé</li>
              <li>• Les frais varient selon la méthode de paiement</li>
              <li>• Vérifiez vos informations bancaires pour éviter les rejets</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}