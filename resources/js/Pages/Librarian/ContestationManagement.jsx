import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock, Eye, MessageSquare, Filter, ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../../services/api';

export default function ContestationManagement() {
  const [contestations, setContestations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContestation, setSelectedContestation] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, en_attente: 0, acceptees: 0, rejetees: 0 });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadContestations();
    loadStats();
  }, [filter]);

  const loadContestations = async () => {
    setIsLoading(true);
    try {
      const data = await api.getLibraryContestations(filter === 'all' ? null : filter);
      setContestations(data.data || []);
    } catch (error) {
      console.error('Erreur chargement contestations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.getContestationStats();
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const handleProcess = async (decision, responseMessage) => {
    if (!selectedContestation) return;
    
    setProcessing(true);
    try {
      const result = await api.processContestation(selectedContestation.id, decision, responseMessage);
      if (result.success) {
        alert(`Contestation ${decision === 'accepted' ? 'acceptée' : 'rejetée'} avec succès`);
        setShowProcessModal(false);
        setSelectedContestation(null);
        loadContestations();
        loadStats();
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Erreur lors du traitement');
    } finally {
      setProcessing(false);
    }
  };

  const goBack = () => {
    router.visit('/librarian/dashboard');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'en attente':
        return <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> En attente</span>;
      case 'acceptée':
        return <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Acceptée</span>;
      case 'rejetée':
        return <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-full text-xs flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejetée</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full text-xs">{status}</span>;
    }
  };

  // Modal de traitement
  const ProcessModal = () => {
    const [decision, setDecision] = useState('accepted');
    const [responseMessage, setResponseMessage] = useState('');

    if (!showProcessModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Traiter la contestation</h3>
            
            {/* Décision */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Décision *
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setDecision('accepted')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    decision === 'accepted'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Accepter
                </button>
                <button
                  onClick={() => setDecision('rejected')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    decision === 'rejected'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Rejeter
                </button>
              </div>
            </div>

            {/* Message de réponse */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message de réponse (optionnel)
              </label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Expliquez votre décision à l'utilisateur..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowProcessModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={() => handleProcess(decision, responseMessage)}
                disabled={processing}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {processing ? 'Traitement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* En-tête avec bouton retour */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={goBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des contestations</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Traitez les contestations des lecteurs</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Statistiques */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.en_attente}</p>
            <p className="text-xs text-yellow-600 dark:text-yellow-500">En attente</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.acceptees}</p>
            <p className="text-xs text-green-600 dark:text-green-500">Acceptées</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.rejetees}</p>
            <p className="text-xs text-red-600 dark:text-red-500">Rejetées</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('en attente')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'en attente'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            En attente
          </button>
          <button
            onClick={() => setFilter('acceptée')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'acceptée'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Acceptées
          </button>
          <button
            onClick={() => setFilter('rejetée')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'rejetée'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Rejetées
          </button>
        </div>

        {/* Liste des contestations */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-orange-600 rounded-full animate-spin"></div>
          </div>
        ) : contestations.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Aucune contestation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contestations.map((contestation) => (
              <div
                key={contestation.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {contestation.user?.name || 'Utilisateur'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {contestation.message}
                    </p>
                  </div>
                  {getStatusBadge(contestation.status)}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(contestation.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    {contestation.status === 'en attente' && (
                      <button
                        onClick={() => {
                          setSelectedContestation(contestation);
                          setShowProcessModal(true);
                        }}
                        className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg text-sm font-medium flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Traiter
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProcessModal />
    </div>
  );
}