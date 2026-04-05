import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Calendar, AlertCircle } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function BorrowingRules() {
  const { user } = useAuth();
  const { props } = usePage();
  const [library, setLibrary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    loan_duration: 14,
    daily_penalty_amount: 100
  });

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!user) return;
      
      const key = `user_library_${user.id}`;
      const savedLibrary = localStorage.getItem(key);
      
      if (savedLibrary) {
        const lib = JSON.parse(savedLibrary);
        setLibrary(lib);
        setFormData({
          loan_duration: lib.loan_duration || 14,
          daily_penalty_amount: lib.daily_penalty_amount || 100
        });
      }
      setIsLoading(false);
    };
    
    fetchLibrary();
  }, [user]);

  const handleSave = async () => {
    if (!library) return;
    
    setIsSaving(true);
    setError('');
    setSuccess(false);
      console.log('Données à envoyer:', {
    loan_duration: formData.loan_duration,
    daily_penalty_amount: formData.daily_penalty_amount
  });
    const formDataToSend = new FormData();
    formDataToSend.append('loan_duration', formData.loan_duration);
    formDataToSend.append('daily_penalty_amount', formData.daily_penalty_amount);
    
    try {
      const result = await api.updateLibrary(library.id, formDataToSend);
        console.log('Résultat API:', result);
      if (result.success) {
        setSuccess(true);
        
        // Mettre à jour localStorage
        const key = `user_library_${user.id}`;
        const updatedLibrary = { ...library, ...formData };
        localStorage.setItem(key, JSON.stringify(updatedLibrary));
        setLibrary(updatedLibrary);
        
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.message || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-orange-600 rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!library) {
    return (
      <MobileLayout>
        <div className="px-6 py-4">
          <button 
            onClick={() => router.visit('/librarian/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune bibliothèque trouvée</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-6 py-4">
        {/* En-tête */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.visit('/librarian/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Règles d'emprunt</h1>
            <p className="text-sm text-gray-500 mt-1">{library.name}</p>
          </div>
        </div>

        {/* Message de succès */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2 animate-fade-in">
            <Save className="w-4 h-4" />
            Règles d'emprunt mises à jour avec succès !
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Durée d'emprunt</span>
              </div>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="60"
                value={formData.loan_duration}
                onChange={(e) => setFormData({ ...formData, loan_duration: parseInt(e.target.value) || 14 })}
                className="w-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
              />
              <span className="text-gray-600">jours</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Nombre de jours maximum pour un emprunt
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span>Pénalité journalière</span>
              </div>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                step=""
                value={formData.daily_penalty_amount}
                onChange={(e) => setFormData({ ...formData, daily_penalty_amount: parseInt(e.target.value) || 100 })}
                className="w-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
              />
              <span className="text-gray-600">FCFA / jour</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Montant de la pénalité par jour de retard
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Informations</p>
                <p className="text-xs text-blue-600 mt-1">
                  Ces règles s'appliqueront à tous les emprunts de votre bibliothèque.
                  Les pénalités seront automatiquement calculées en cas de retard.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-orange-600 text-white font-semibold py-4 rounded-xl hover:bg-orange-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer les règles
              </>
            )}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}