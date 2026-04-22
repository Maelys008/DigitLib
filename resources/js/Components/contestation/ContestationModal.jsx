import { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import api from '../../services/api';

export default function ContestationModal({ isOpen, onClose, incident, onSuccess }) {
  const [message, setMessage] = useState('');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!message.trim()) {
    setError('Veuillez expliquer votre contestation');
    return;
  }

  setIsSubmitting(true);
  setError(null);

  try {
    console.log('📤 Envoi contestation:', {
      incident_id: incident.id,
      message: message,
      justification: justification
    });

    const result = await api.createContestation(incident.id, message, justification);
    console.log('📥 Réponse:', result);
    
    if (result.success) {
      onSuccess?.();
      onClose();
      alert('Votre contestation a été envoyée avec succès !');
    } else {
      console.log('❌ Erreur:', result);
      setError(result.message || 'Erreur inconnue');
    }
  } catch (err) {
    console.error('❌ Erreur catch:', err.response?.data);
    // Affiche les erreurs de validation détaillées
    if (err.response?.data?.errors) {
      const errors = Object.values(err.response.data.errors).flat();
      setError(errors.join(', '));
    } else {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi');
    }
  } finally {
    setIsSubmitting(false);
  }
};
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contester l'incident</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Incident concerné */}
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Incident contesté :</p>
            <p className="text-sm text-red-700 dark:text-red-400">{incident.description}</p>
            <p className="text-xs text-red-600 dark:text-red-500 mt-1">
              Date : {new Date(incident.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message de contestation *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Expliquez pourquoi vous contestez cet incident..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Justification (documents, preuves...)
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Ajoutez des preuves ou des informations complémentaires..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Optionnel - Vous pouvez fournir des preuves ou des détails supplémentaires
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Envoyer la contestation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}