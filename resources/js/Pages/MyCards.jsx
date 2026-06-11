import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, CreditCard, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../services/api';
import KkiapayPayment from '@/Components/Payment/KkiapayPayment';

export default function MyCards() {
  const [unpaidPenalties, setUnpaidPenalties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPenalty, setSelectedPenalty] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchUnpaidPenalties();
  }, []);

const fetchUnpaidPenalties = async () => {
  setIsLoading(true);
  try {
    // 🔥 Utilise la nouvelle méthode pour lecteur
    const non_payé = await api.getMyUnpaidPenalties();
    console.log('💰 Pénalités non payées:', non_payé);
    setUnpaidPenalties(non_payé);
  } catch (error) {
    console.error('Erreur chargement pénalités:', error);
  } finally {
    setIsLoading(false);
  }
};

  const handlePaymentSuccess = (penaltyId) => {
    setUnpaidPenalties(prev => prev.filter(p => p.id !== penaltyId));
    setShowPaymentModal(false);
    setSelectedPenalty(null);
  };

  const getPenaltyIcon = (reason) => {
    if (reason?.toLowerCase().includes('retard')) return '⏰';
    if (reason?.toLowerCase().includes('perdu')) return '📖';
    return '⚠️';
  };

  return (
    <MobileLayout>
      <div className="min-h-screen bg-[#F9F9F9] dark:bg-gray-900">
        <div className="relative flex items-center justify-center px-4 py-4 bg-white dark:bg-gray-800">
          <button 
            onClick={() => router.visit('/profile')}
            className="absolute left-4 p-1"
          >
            <ArrowLeft className="w-6 h-6 text-gray-800 dark:text-gray-200" />
          </button>
          <h1 className="text-[17px] font-semibold text-black dark:text-white">Mes cartes</h1>
        </div>

        <div className="px-4 py-6 space-y-4">
          {/* Section Pénalités à payer */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
              Pénalités à payer
            </h2>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              </div>
            ) : unpaidPenalties.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Aucune pénalité à payer
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {unpaidPenalties.map((penalty) => (
                  <div
                    key={penalty.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-xl">
                        {getPenaltyIcon(penalty.reason)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {penalty.reason || 'Pénalité'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          Livre: {penalty.loan?.copy?.book?.title || 'N/A'}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">Bibliothèque:</span>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {penalty.loan?.copy?.book?.library?.name || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                              {penalty.amount.toLocaleString()} FCFA
                            </span>
                            <button
                              onClick={() => {
                                setSelectedPenalty(penalty);
                                setShowPaymentModal(true);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-medium"
                            >
                              Payer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section Cartes enregistrées */}
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
              Cartes enregistrées
            </h2>
            
            <div className="space-y-2">
              <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl">
                <div className="w-8 h-8 flex items-center justify-center">
                  <div className="flex -space-x-2">
                    <div className="w-5 h-5 bg-red-500 rounded-full opacity-90" />
                    <div className="w-5 h-5 bg-yellow-500 rounded-full opacity-90" />
                  </div>
                </div>
                <span className="text-[16px] font-medium text-black dark:text-white">Mastercard **** 6409</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl">
                <div className="w-8 h-8 flex items-center justify-center">
                  <span className="italic font-black text-blue-800 dark:text-blue-400 text-xs">VISA</span>
                </div>
                <span className="text-[16px] font-medium text-black dark:text-white">Visa **** 0372</span>
              </div>
            </div>
            
            <button
              className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl mt-3"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-black dark:text-gray-300" />
                </div>
                <span className="text-[16px] font-medium text-black dark:text-white">Ajouter une carte</span>
              </div>
              <Plus className="w-5 h-5 text-gray-400 dark:text-gray-500 font-light" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de paiement */}
      <KkiapayPayment
        isOpen={showPaymentModal}
        penalty={selectedPenalty}
        onSuccess={handlePaymentSuccess}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedPenalty(null);
        }}
      />
    </MobileLayout>
  );
}