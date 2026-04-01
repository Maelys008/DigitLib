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

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        const libraries = await api.getUserLibraries();
        const userLibrary = libraries.find(lib => lib.administrator_id === user.id);
        
        if (userLibrary) {
          setLibrary(userLibrary);
          
          const loansData = await api.getLibraryLoans(userLibrary.id);
          setLoans(loansData);
          
          const reservationsData = await api.getLibraryReservations(userLibrary.id);
          setReservations(reservationsData.reservations || []);
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

  const handleReturnBook = async () => {
    if (!returningLoan) return;
    
    try {
      const result = await api.returnBook(
        returningLoan.id,
        returnCondition,
        penaltyAmount ? parseFloat(penaltyAmount) : null,
        penaltyReason
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

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!library) {
    return (
      <MobileLayout>
        <div className="p-6 text-center">
          <p className="text-gray-500">Aucune bibliothèque trouvée</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.visit('/librarian/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Gestion des utilisateurs</h1>
              <p className="text-sm text-gray-500 mt-1">{library.name}</p>
            </div>
          </div>
        </div>

        {/* Message de notification */}
        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-xl flex items-center justify-between ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              <AlertCircle className={`w-5 h-5 ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`} />
              <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </span>
            </div>
            <button onClick={() => setMessage(null)} className="p-1 hover:bg-gray-200 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Onglets */}
        <div className="px-6 mt-4 border-b border-gray-200 bg-white">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('loans')}
              className={`pb-3 px-2 font-medium transition-colors ${
                activeTab === 'loans'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
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
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom d'utilisateur ou titre de livre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>
        </div>

        {/* Liste des emprunts */}
        {activeTab === 'loans' && (
          <div className="px-6 py-4 space-y-3">
            {filteredLoans.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucun emprunt en cours</p>
                <p className="text-sm text-gray-400 mt-1">Tous les livres sont disponibles</p>
              </div>
            ) : (
              filteredLoans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  type="loan"
                  onReturn={openReturnModal}
                />
              ))
            )}
          </div>
        )}

        {/* Liste des réservations */}
        {activeTab === 'reservations' && (
          <div className="px-6 py-4 space-y-3">
            {filteredReservations.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucune réservation en attente</p>
                <p className="text-sm text-gray-400 mt-1">La liste d'attente est vide</p>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Retour du livre</h2>
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="font-semibold text-gray-900">{returningLoan.copy?.book?.title}</p>
                <p className="text-sm text-gray-500 mt-1">Emprunté par: {returningLoan.user?.name}</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  État du livre
                </label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="neuf">Neuf - Excellent état</option>
                  <option value="bon">Bon - Quelques signes d'usage</option>
                  <option value="abimé">Abîmé - Dommages mineurs</option>
                  <option value="très abimé">Très abîmé - Dommages importants</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pénalité supplémentaire (FCFA)
                </label>
                <input
                  type="number"
                  value={penaltyAmount}
                  onChange={(e) => setPenaltyAmount(e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison de la pénalité
                </label>
                <input
                  type="text"
                  value={penaltyReason}
                  onChange={(e) => setPenaltyReason(e.target.value)}
                  placeholder="Livre abîmé, page déchirée, etc."
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReturnBook}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
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