import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Clock, User, Calendar, MessageSquare, FileText } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import api from '../../services/api';

export default function ContestationDetail() {
  const { props } = usePage();
  const { id } = props;
  const [contestation, setContestation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContestation();
  }, [id]);

  const fetchContestation = async () => {
    setIsLoading(true);
    try {
      const data = await api.getContestation(id);
      setContestation(data);
    } catch (error) {
      console.error('Erreur chargement contestation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'en attente':
        return <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> En attente</span>;
      case 'acceptée':
        return <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Acceptée</span>;
      case 'rejetée':
        return <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-full text-sm flex items-center gap-2"><XCircle className="w-4 h-4" /> Rejetée</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full text-sm">{status}</span>;
    }
  };

  const goBack = () => {
    router.visit('/profile/contestations');
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

  if (!contestation) {
    return (
      <MobileLayout>
        <div className="px-6 py-4 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Contestation non trouvée</p>
          <button onClick={goBack} className="mt-4 text-orange-600 dark:text-orange-400 font-medium">
            Retour aux contestations
          </button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Détail de la contestation</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">#{contestation.id}</p>
            </div>
          </div>
        </div>

        <div className="p-6 max-w-2xl mx-auto">
          {/* Statut */}
          <div className="mb-6 flex justify-center">
            {getStatusBadge(contestation.status)}
          </div>

          {/* Message de contestation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              Votre message
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {contestation.message}
            </p>
          </div>

          {/* Justification */}
          {contestation.justification && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Justification / Preuves
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {contestation.justification}
              </p>
            </div>
          )}

          {/* Incident concerné */}
          {contestation.incident && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 shadow-sm mb-6 border border-red-200 dark:border-red-800">
              <h3 className="font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Incident contesté
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                {contestation.incident.description}
              </p>
              <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                Date : {new Date(contestation.incident.date).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}

          {/* Informations complémentaires */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500" />
              Informations
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Contestation faite le :</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(contestation.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}