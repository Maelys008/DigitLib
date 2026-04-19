import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Clock, Search, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import MobileLayout from '@/Layouts/MobileLayout';
import LoanCard from '@/Components/liberian/LoanCard';

export default function ManageUsers() {
  const { user } = useAuth();
  const [library, setLibrary] = useState(null);
  const [loans, setLoans] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('loans');
  const [searchTerm, setSearchTerm] = useState('');
  const [returningLoan, setReturningLoan] = useState(null);
  const [returnCondition, setReturnCondition] = useState('bon');
  const [penaltyAmount, setPenaltyAmount] = useState('');
  const [penaltyReason, setPenaltyReason] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [message, setMessage] = useState(null);
  const [penaltyError, setPenaltyError] = useState('');

  const requiresPenalty = returnCondition === 'abimé' || returnCondition === 'très abimé';

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        const libraries = await api.getUserLibraries();
        const userLibrary = libraries.find(lib => lib.administrator_id === user.id);
        
        if (userLibrary) {
          setLibrary(userLibrary);
          
          // Récupérer TOUS les emprunts (inclut pending_pickup et active)
          const loansData = await api.getLibraryLoans(userLibrary.id);
          console.log('📚 Emprunts:', loansData);
          setLoans(loansData);
          
          // Récupérer UNIQUEMENT les réservations actives (en attente)
          const activeReservationsData = await api.getActiveReservations(userLibrary.id);
          console.log('📋 Réservations actives:', activeReservationsData);
          setReservations(activeReservationsData.reservations || []);
        }
      } catch (error) {
        console.error('Erreur chargement données:', error);
        setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  useEffect(() => {
    if (!requiresPenalty) {
      setPenaltyAmount('');
      setPenaltyReason('');
      setPenaltyError('');
    }
  }, [returnCondition]);

  const handleReturnBook = async () => {
    if (!returningLoan) return;
    
    if (requiresPenalty) {
      const amount = parseFloat(penaltyAmount);
      if (!penaltyAmount || isNaN(amount) || amount <= 0) {
        setPenaltyError('La pénalité doit être supérieure à 0 FCFA');
        return;
      }
      if (!penaltyReason.trim()) {
        setPenaltyError('Veuillez indiquer une raison pour la pénalité');
        return;
      }
    }
    
    setPenaltyError('');
    
    try {
      const result = await api.returnBook(
        returningLoan.id,
        returnCondition,
        requiresPenalty ? parseFloat(penaltyAmount) : null,
        requiresPenalty ? penaltyReason : null
      );
      
      if (result.success) {
        setMessage({ type: 'success', text: result.data.message });
        const loansData = await api.getLibraryLoans(library.id);
        setLoans(loansData);
        setShowReturnModal(false);
        setReturningLoan(null);
        setPenaltyAmount('');
        setPenaltyReason('');
        setReturnCondition('bon');
        setPenaltyError('');
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du retour du livre' });
    }
    
    setTimeout(() => setMessage(null), 5000);
  };

  const openReturnModal = (loan) => {
    setReturningLoan(loan);
    setReturnCondition('bon');
    setPenaltyAmount('');
    setPenaltyReason('');
    setPenaltyError('');
    setShowReturnModal(true);
  };

  const filteredLoans = loans.filter(loan => 
    !loan.actual_return_date && (
      loan.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.copy?.book?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredReservations = reservations.filter(res => 
    res.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.book?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirmPickup = async (loan) => {
    try {
      const result = await api.confirmPickup(loan.id);
      if (result.success) {
        setMessage({ type: 'success', text: 'Retrait confirmé avec succès !' });
        const loansData = await api.getLibraryLoans(library.id);
        setLoans(loansData);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la confirmation du retrait' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!library) {
    return (
      <MobileLayout>
        <div className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">Aucune bibliothèque trouvée</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.visit('/librarian/dashboard')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gestion des utilisateurs</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{library.name}</p>
            </div>
          </div>
        </div>

        {/* Message de notification */}
        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-xl flex items-center justify-between ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-3">
              <AlertCircle className={`w-5 h-5 ${
                message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`} />
              <span className={message.type === 'success' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}>
                {message.text}
              </span>
            </div>
            <button onClick={() => setMessage(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}

        {/* Onglets */}
        <div className="px-6 mt-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('loans')}
              className={`pb-3 px-2 font-medium transition-colors ${
                activeTab === 'loans'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Emprunts en cours ({filteredLoans.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`pb-3 px-2 font-medium transition-colors ${
                activeTab === 'reservations'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Réservations ({filteredReservations.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="px-6 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher par nom d'utilisateur ou titre de livre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* Liste des emprunts */}
        {activeTab === 'loans' && (
          <div className="px-6 py-4 space-y-3">
            {filteredLoans.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
                <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Aucun emprunt en cours</p>
              </div>
            ) : (
              filteredLoans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  type="loan"
                  onReturn={openReturnModal}
                  onConfirmPickup={handleConfirmPickup}
                />
              ))
            )}
          </div>
        )}

        {/* Liste des réservations */}
        {activeTab === 'reservations' && (
          <div className="px-6 py-4 space-y-3">
            {filteredReservations.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
                <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune réservation en attente</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">La liste d'attente est vide</p>
              </div>
            ) : (
              filteredReservations.map((res) => (
                <LoanCard
                  key={res.id}
                  loan={res}
                  type="reservation"
                />
              ))
            )}
          </div>
        )}

        {/* Modal de retour de livre */}
        {showReturnModal && returningLoan && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Retour du livre</h2>
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
                <p className="font-semibold text-gray-900 dark:text-white">{returningLoan.copy?.book?.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Emprunté par: {returningLoan.user?.name}</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  État du livre
                </label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="neuf">Neuf</option>
                  <option value="bon">Bon</option>
                  <option value="abimé">Abîmé</option>
                  <option value="très abimé">Très abîmé</option>
                </select>
              </div>
              
              {requiresPenalty && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pénalité supplémentaire (FCFA) *
                    </label>
                    <input
                      type="number"
                      value={penaltyAmount}
                      onChange={(e) => {
                        setPenaltyAmount(e.target.value);
                        setPenaltyError('');
                      }}
                      placeholder="Montant de la pénalité"
                      className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                        penaltyError && !penaltyAmount ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
                      }`}
                    />
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Le montant doit être supérieur à 0 FCFA</p>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Raison de la pénalité *
                    </label>
                    <input
                      type="text"
                      value={penaltyReason}
                      onChange={(e) => {
                        setPenaltyReason(e.target.value);
                        setPenaltyError('');
                      }}
                      placeholder="Ex: Page déchirée, couverture abîmée, etc."
                      className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                        penaltyError && !penaltyReason ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
                      }`}
                    />
                  </div>
                  
                  {penaltyError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <p className="text-red-600 dark:text-red-400 text-sm">{penaltyError}</p>
                    </div>
                  )}
                </>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReturnBook}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-medium"
                >
                  Confirmer le retour
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}