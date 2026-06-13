import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { ArrowLeft, AlertCircle, CheckCircle, X, Search, DollarSign, Calendar, User, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveLibrary } from '@/contexts/ActiveLibraryContext'; // ← AJOUTE CETTE LIGNE
import api from '../../services/api';
import MobileLayout from '@/Layouts/MobileLayout';
import BottomNav from '@/Components/BottomNav';

export default function ManagePenalties() {
  const { user } = useAuth();
  const { activeLibrary, isLoading: libraryLoading } = useActiveLibrary(); // ← AJOUTE CETTE LIGNE
  const [library, setLibrary] = useState(null);
  const [allPenalties, setAllPenalties] = useState([]); 
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState(null);
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // 🔥 Utilise la bibliothèque active du Context
        if (activeLibrary) {
          console.log('📚 ManagePenalties - Utilisation de la bibliothèque active:', activeLibrary.name);
          setLibrary(activeLibrary);
          await loadPenalties(activeLibrary.id);
        } else {
          // Fallback: cherche la bibliothèque où l'utilisateur est admin
          const libraries = await api.getUserLibraries();
          const userLibrary = libraries.find(lib => lib.administrator_id === user.id);
          
          if (userLibrary) {
            setLibrary(userLibrary);
            await loadPenalties(userLibrary.id);
          } else {
            setMessage({ type: 'error', text: 'Vous n\'êtes administrateur d\'aucune bibliothèque' });
          }
        }
      } catch (error) {
        console.error('Erreur chargement données:', error);
        setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!libraryLoading) {
      loadData();
    }
  }, [user, activeLibrary, libraryLoading]);

  const loadPenalties = async (libraryId) => {
    try {
      const penalties = await api.getPenalties(libraryId);
      console.log(`Pénalités de la bibliothèque ${libraryId}:`, penalties);
      setAllPenalties(penalties);
    } catch (error) {
      console.error('Erreur chargement pénalités:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des pénalités' });
    }
  };

  const handlePayPenalty = async (penaltyId) => {
    setPayingId(penaltyId);
    
    try {
      const result = await api.payPenalty(penaltyId);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Pénalité réglée avec succès !' });
        if (library) {
          await loadPenalties(library.id);
        }
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du paiement' });
    } finally {
      setPayingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getFilteredPenalties = () => {
    let filtered = allPenalties;
    
    if (filterStatus === 'payé') {
      filtered = filtered.filter(p => p.status === 'payé');
    } else if (filterStatus === 'non_payé') {
      filtered = filtered.filter(p => p.status === 'non_payé');
    }
    
    if (searchTerm) {
      filtered = filtered.filter(penalty => 
        penalty.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        penalty.loan?.copy?.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        penalty.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredPenalties = getFilteredPenalties();
  
  const unpaidCount = allPenalties.filter(p => p.status === 'non_payé').length;
  const paidCount = allPenalties.filter(p => p.status === 'payé').length;
  const totalAmount = filteredPenalties.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Vérifie si l'utilisateur est admin de cette bibliothèque
  const isAdmin = library && library.administrator_id === user?.id;

  // Redirige si l'utilisateur n'est pas admin
  if (!isLoading && !libraryLoading && !isAdmin) {
    return (
      <>
        <div className="p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300 font-medium">Accès non autorisé</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Seuls les administrateurs peuvent accéder à cette page.
          </p>
          <button
            onClick={() => router.visit('/librarian/dashboard')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Retour au tableau de bord
          </button>
        </div>
      </>
    );
  }

  if (isLoading || libraryLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  if (!library) {
    return (
      <>
        <div className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">Vous n'êtes administrateur d'aucune bibliothèque</p>
          <button
            onClick={() => router.visit('/librarian/dashboard')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Retour au tableau de bord
          </button>
        </div>
      </>
    );
  }

  return (
    <>
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gestion des pénalités</h1>
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

        {/* Filtres */}
        <div className="px-6 mt-4">
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterStatus === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Tous ({allPenalties.length})
            </button>
            <button
              onClick={() => setFilterStatus('non_payé')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterStatus === 'non_payé' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Non payées ({unpaidCount})
            </button>
            <button
              onClick={() => setFilterStatus('payé')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterStatus === 'payé' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Payées ({paidCount})
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="px-6 mt-2">
          <div className={`rounded-2xl p-4 text-white ${
            filterStatus === 'payé' 
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : filterStatus === 'non_payé'
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : 'bg-gradient-to-r from-purple-500 to-purple-600'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">
                  {filterStatus === 'payé' ? 'Total des pénalités payées' : 
                   filterStatus === 'non_payé' ? 'Total des pénalités impayées' : 
                   'Total général'}
                </p>
                <p className="text-2xl font-bold">{totalAmount.toLocaleString()} FCFA</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs opacity-80 mt-2">
              {filteredPenalties.length} pénalité{filteredPenalties.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="px-6 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher par nom d'utilisateur, titre de livre ou raison..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* Liste des pénalités */}
        <div className="px-6 py-4 space-y-3">
          {filteredPenalties.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
              <CheckCircle className="w-16 h-16 text-green-300 dark:text-green-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune pénalité trouvée</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                {filterStatus === 'payé' ? 'Aucune pénalité payée pour cette bibliothèque' :
                 filterStatus === 'non_payé' ? 'Toutes les pénalités de cette bibliothèque ont été réglées' :
                 'Aucune pénalité pour cette bibliothèque'}
              </p>
            </div>
          ) : (
            filteredPenalties.map((penalty) => (
              <div key={penalty.id} className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border ${
                penalty.status === 'payé' ? 'border-green-200 dark:border-green-800' : 'border-gray-100 dark:border-gray-700'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Statut */}
                    <div className="mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        penalty.status === 'payé' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {penalty.status === 'payé' ? '✓ Payée' : '⏳ Non payée'}
                      </span>
                    </div>
                    
                    {/* Livre */}
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">{penalty.loan?.copy?.book?.title || 'Livre inconnu'}</h3>
                    </div>
                    
                    {/* Utilisateur */}
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 dark:text-gray-400">
                      <User className="w-4 h-4" />
                      <span>{penalty.user?.name || 'Utilisateur inconnu'}</span>
                    </div>
                    
                    {/* Raison */}
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 dark:text-gray-400">
                      <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                      <span className="line-clamp-2">{penalty.reason || 'Pénalité de retard'}</span>
                    </div>
                    
                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{penalty.created_at ? new Date(penalty.created_at).toLocaleDateString() : 'Date inconnue'}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">{penalty.amount?.toLocaleString()} FCFA</p>
                    {penalty.status === 'non_payé' && (
                      <button
                        onClick={() => handlePayPenalty(penalty.id)}
                        disabled={payingId === penalty.id}
                        className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium disabled:bg-gray-400 dark:disabled:bg-gray-600"
                      >
                        {payingId === penalty.id ? 'Traitement...' : 'Marquer payé ✓'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav active="penalties" />
    </>
  );
}