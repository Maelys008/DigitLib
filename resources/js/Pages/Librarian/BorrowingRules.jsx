import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Calendar, AlertCircle } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveLibrary } from '@/contexts/ActiveLibraryContext'; 
import api from '../../services/api';

export default function BorrowingRules() {
  const { user } = useAuth();
  const { activeLibrary, isLoading: libraryLoading } = useActiveLibrary(); 
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
      
      // 🔥 Utilise la bibliothèque active du Context
      let lib = activeLibrary;
      
      if (!lib) {
        // Fallback: cherche la bibliothèque où l'utilisateur est admin
        const libraries = await api.getUserLibraries();
        lib = libraries.find(l => l.administrator_id === user.id);
      }
      
      if (lib) {
        console.log('📚 BorrowingRules - Bibliothèque chargée:', lib.name);
        setLibrary(lib);
        setFormData({
          loan_duration: lib.loan_duration || 14,
          daily_penalty_amount: lib.daily_penalty_amount || 100
        });
      }
      setIsLoading(false);
    };
    
    if (!libraryLoading) {
      fetchLibrary();
    }
  }, [user, activeLibrary, libraryLoading]);

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
        
        // Met à jour la bibliothèque dans le state
        const updatedLibrary = { ...library, ...formData };
        setLibrary(updatedLibrary);
        
        // Met à jour le localStorage
        const key = `user_library_${user.id}`;
        localStorage.setItem(key, JSON.stringify(updatedLibrary));
        
        // 🔥 Met aussi à jour le Context si la bibliothèque active est la même
        if (activeLibrary && activeLibrary.id === library.id) {
          // Recharge la bibliothèque dans le Context
          const refreshedLibrary = await api.getLibrary(library.id);
          localStorage.setItem('active_library_id', refreshedLibrary.id);
          localStorage.setItem('active_library_name', refreshedLibrary.name);
        }
        
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

  // Vérifie si l'utilisateur est admin de cette bibliothèque
  const isAdmin = library && library.administrator_id === user?.id;

  // Redirige si l'utilisateur n'est pas admin
  if (!isLoading && !libraryLoading && !isAdmin && library) {
    return (
      <>
        <div className="px-6 py-4">
          <button 
            onClick={() => router.visit('/librarian/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 dark:text-gray-300 font-medium">Accès non autorisé</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Seuls les administrateurs peuvent modifier les règles d'emprunt.
            </p>
            <button
              onClick={() => router.visit('/librarian/dashboard')}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </>
    );
  }

  if (isLoading || libraryLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-orange-600 rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  if (!library) {
    return (
      <>
        <div className="px-6 py-4">
          <button 
            onClick={() => router.visit('/librarian/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Aucune bibliothèque trouvée</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="px-6 py-4">
        {/* En-tête */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.visit('/librarian/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Règles d'emprunt</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{library.name}</p>
          </div>
        </div>

        {/* Message de succès */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm flex items-center gap-2 animate-fade-in">
            <Save className="w-4 h-4" />
            Règles d'emprunt mises à jour avec succès !
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Formulaire */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
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
                className="w-32 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
              />
              <span className="text-gray-600 dark:text-gray-400">jours</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Nombre de jours maximum pour un emprunt
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
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
                className="w-32 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
              />
              <span className="text-gray-600 dark:text-gray-400">FCFA / jour</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Montant de la pénalité par jour de retard
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Informations</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Ces règles s'appliqueront à tous les emprunts de votre bibliothèque.
                  Les pénalités seront automatiquement calculées en cas de retard.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-orange-600 dark:bg-orange-500 text-white font-semibold py-4 rounded-xl hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center justify-center gap-2"
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
    </>
  );
}