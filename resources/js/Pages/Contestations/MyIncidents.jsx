import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle, ArrowLeft, MessageSquare } from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../../services/api';
import ContestationModal from '@/Components/contestation/ContestationModal';

export default function MyIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showContestationModal, setShowContestationModal] = useState(false);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    setIsLoading(true);
    try {
      // Récupère les incidents de l'utilisateur connecté
      const data = await api.getUserIncidents();
      setIncidents(data);
    } catch (error) {
      console.error('Erreur chargement incidents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-xs">En contestation</span>;
      case 'resolved':
        return <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs">Résolu</span>;
      case 'dismissed':
        return <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full text-xs">Annulé</span>;
      default:
        return <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-full text-xs">En attente</span>;
    }
  };

 const handleContester = (incident) => {
  console.log('📋 Incident à contester:', incident);
  console.log('ID:', incident.id);
  console.log('Status:', incident.status);
  
  if (!incident.id) {
    alert('Impossible de contester : incident invalide');
    return;
  }
  
  setSelectedIncident(incident);
  setShowContestationModal(true);
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
        {/* En-tête */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes incidents</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Suivez et contestez vos incidents</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {incidents.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
              <AlertTriangle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Aucun incident</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Vous n'avez aucun incident sur votre compte
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div key={incident.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{incident.title || 'Incident'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{incident.description}</p>
                    </div>
                    {getStatusBadge(incident.status)}
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(incident.date).toLocaleDateString('fr-FR')}
                    </div>
                    
                    {/* 🔥 BOUTON CONTESTER */}
                    {incident.status !== 'resolved' && incident.status !== 'dismissed' && (
                      <button
                        onClick={() => handleContester(incident)}
                        className="px-3 py-1 bg-orange-600 text-white rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-orange-700 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Contester
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de contestation */}
      <ContestationModal
        isOpen={showContestationModal}
        onClose={() => {
          setShowContestationModal(false);
          setSelectedIncident(null);
        }}
        incident={selectedIncident}
        onSuccess={() => {
          loadIncidents();
        }}
      />
    </MobileLayout>
  );
}