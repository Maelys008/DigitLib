import { useState, useEffect } from 'react';
import MobileLayout from '@/Layouts/MobileLayout';
import { AlertTriangle, CheckCircle, XCircle, Clock, Eye, ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../../services/api';

export default function ContestationList() {
  const [contestations, setContestations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ en_attente: 0, acceptees: 0, rejetees: 0 });

  useEffect(() => {
    loadContestations();
  }, []);

  const loadContestations = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUserContestations();
      setContestations(data);
      
      // Calculer les stats
      const enAttente = data.filter(c => c.status === 'en attente').length;
      const acceptees = data.filter(c => c.status === 'acceptée').length;
      const rejetees = data.filter(c => c.status === 'rejetée').length;
      setStats({ en_attente: enAttente, acceptees, rejetees });
    } catch (error) {
      console.error('Erreur chargement contestations:', error);
    } finally {
      setIsLoading(false);
    }
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

  const goToDetail = (id) => {
    router.visit(`/profile/contestations/${id}`);
  };

 const goBack = () => {
  window.history.back();
};

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-orange-600 rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes contestations</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Suivez l'état de vos contestations</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.en_attente}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-500">En attente</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.acceptees}</p>
              <p className="text-xs text-green-600 dark:text-green-500">Acceptées</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.rejetees}</p>
              <p className="text-xs text-red-600 dark:text-red-500">Rejetées</p>
            </div>
          </div>

          {/* Liste des contestations */}
          {contestations.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
              <AlertTriangle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Aucune contestation</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Vous n'avez pas encore contesté d'incident
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {contestations.map((contestation) => (
                <div
                  key={contestation.id}
                  onClick={() => goToDetail(contestation.id)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                        {contestation.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(contestation.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {getStatusBadge(contestation.status)}
                  </div>
                  
                  {/* Aperçu de l'incident concerné */}
                  {contestation.incident && (
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Incident : {contestation.incident.description?.substring(0, 80)}...
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}