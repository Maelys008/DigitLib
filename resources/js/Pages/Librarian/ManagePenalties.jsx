import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { ArrowLeft, AlertCircle, CheckCircle, X, Search, DollarSign, Calendar, User, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import MobileLayout from '@/Layouts/MobileLayout';

export default function ManagePenalties() {
  const { user } = useAuth();
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
        const libraries = await api.getUserLibraries();
        const userLibrary = libraries.find(lib => lib.administrator_id === user.id);
        
        if (userLibrary) {
          setLibrary(userLibrary);
          await loadPenalties();
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

  const loadPenalties = async () => {
    try {
      // Récupérer TOUTES les pénalités depuis la base de données
      const penalties = await api.getPenalties();
      console.log('Toutes les pénalités de la base:', penalties);
      
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
        // Recharger la liste des pénalités
        await loadPenalties();
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

  // Filtrer les pénalités selon le statut et la recherche
  const getFilteredPenalties = () => {
    let filtered = allPenalties;
    
    // Filtre par statut
    if (filterStatus === 'paid') {
      filtered = filtered.filter(p => p.status === 'payé');
    } else if (filterStatus === 'unpaid') {
      filtered = filtered.filter(p => p.status === 'non payé');
    }
    
    // Filtre par recherche
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
  
  const unpaidCount = allPenalties.filter(p => p.status === 'non payé').length;
  const paidCount = allPenalties.filter(p => p.status === 'payé').length;
  const totalAmount = filteredPenalties.reduce((sum, p) => sum + (p.amount || 0), 0);

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
              <h1 className="text-xl font-bold text-gray-900">Gestion des pénalités</h1>
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

        {/* Filtres */}
        <div className="px-6 mt-4">
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterStatus === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tous ({allPenalties.length})
            </button>
            <button
              onClick={() => setFilterStatus('unpaid')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterStatus === 'unpaid' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Non payées ({unpaidCount})
            </button>
            <button
              onClick={() => setFilterStatus('paid')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterStatus === 'paid' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Payées ({paidCount})
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="px-6 mt-2">
          <div className={`rounded-2xl p-4 text-white ${
            filterStatus === 'paid' 
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : filterStatus === 'unpaid'
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : 'bg-gradient-to-r from-purple-500 to-purple-600'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">
                  {filterStatus === 'paid' ? 'Total des pénalités payées' : 
                   filterStatus === 'unpaid' ? 'Total des pénalités impayées' : 
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom d'utilisateur, titre de livre ou raison..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>
        </div>

        {/* Liste des pénalités */}
        <div className="px-6 py-4 space-y-3">
          {filteredPenalties.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl">
              <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucune pénalité trouvée</p>
              <p className="text-sm text-gray-400 mt-1">
                {filterStatus === 'paid' ? 'Aucune pénalité payée pour le moment' :
                 filterStatus === 'unpaid' ? 'Toutes les pénalités ont été réglées' :
                 'Aucune pénalité dans la base de données'}
              </p>
            </div>
          ) : (
            filteredPenalties.map((penalty) => (
              <div key={penalty.id} className={`bg-white rounded-xl p-4 shadow-sm border ${
                penalty.status === 'payé' ? 'border-green-200' : 'border-gray-100'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Statut */}
                    <div className="mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        penalty.status === 'payé' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {penalty.status === 'payé' ? '✓ Payée' : '⏳ Non payée'}
                      </span>
                    </div>
                    
                    {/* Livre */}
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <h3 className="font-semibold text-gray-900">{penalty.loan?.copy?.book?.title || 'Livre inconnu'}</h3>
                    </div>
                    
                    {/* Utilisateur */}
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{penalty.user?.name || 'Utilisateur inconnu'}</span>
                    </div>
                    
                    {/* Raison */}
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="line-clamp-2">{penalty.reason || 'Pénalité de retard'}</span>
                    </div>
                    
                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{penalty.created_at ? new Date(penalty.created_at).toLocaleDateString() : 'Date inconnue'}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{penalty.amount?.toLocaleString()} FCFA</p>
                    {penalty.status === 'non payé' && (
                      <button
                        onClick={() => handlePayPenalty(penalty.id)}
                        disabled={payingId === penalty.id}
                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:bg-gray-400"
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
    </MobileLayout>
  );
}