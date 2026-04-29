import { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, Camera, MapPin, FileText, Users, BookOpen, Save, X, Library as LibraryIcon, Clock, AlertCircle, Phone } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function LibraryDetail() {
  const { props } = usePage();
  const { id } = props;
  const { user } = useAuth();
  const [library, setLibrary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [booksCount, setBooksCount] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    adress: '',
    library_phone: '', 
    description: '',
    loan_duration: 14,
    daily_penalty_amount: 0
  });

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const data = await api.getLibrary(id);
        setLibrary(data);
        setFormData({
          name: data.name || '',
          adress: data.adress || '',
          library_phone: data.library_phone || '',
          description: data.description || '',
          loan_duration: data.loan_duration || 14,
          daily_penalty_amount: data.daily_penalty_amount || 0
        });
        if (data.library_image) {
          setImagePreview(`/storage/${data.library_image}`);
        }
        
        const booksResponse = await api.getBooks({ library_id: id, per_page: 1 });
        setBooksCount(booksResponse.data?.total || 0);
        
      } catch (error) {
        console.error('Erreur chargement bibliothèque:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLibrary();
  }, [id]);

  // 🔥 Mettre à jour l'aperçu quand library change
  useEffect(() => {
    if (library?.library_image) {
      setImagePreview(`/storage/${library.library_image}`);
    }
  }, [library]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('adress', formData.adress);
    formDataToSend.append('library_phone', formData.library_phone);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('loan_duration', formData.loan_duration);
    formDataToSend.append('daily_penalty_amount', formData.daily_penalty_amount);
    
    // Seulement si une nouvelle image est sélectionnée
    if (newImageFile) {
      formDataToSend.append('library_image', newImageFile);
    }

    const result = await api.updateLibrary(id, formDataToSend);
    
    if (result.success) {
      setIsEditing(false);
      // Recharger les données à jour
      const updatedLibrary = await api.getLibrary(id);
      setLibrary(updatedLibrary);
      
      // Mettre à jour l'aperçu de l'image
      if (updatedLibrary.library_image) {
        setImagePreview(`/storage/${updatedLibrary.library_image}`);
      } else {
        setImagePreview(null);
      }
      
      setFormData({
        name: updatedLibrary.name || '',
        adress: updatedLibrary.adress || '',
        library_phone: updatedLibrary.library_phone || '',
        description: updatedLibrary.description || '',
        loan_duration: updatedLibrary.loan_duration || 14,
        daily_penalty_amount: updatedLibrary.daily_penalty_amount || 0
      });
      
      // Réinitialiser le fichier sélectionné
      setNewImageFile(null);
    } else {
      setError(result.message);
    }
    setIsSubmitting(false);
  };

  const handleBack = () => {
    router.visit('/librarian/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!library) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Bibliothèque non trouvée</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* En-tête */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Détails de la bibliothèque</h1>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors"
            >
              <Edit2 className="w-4 h-4" /> Modifier
            </button>
          )}
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image de la bibliothèque</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Bibliothèque" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-sm text-gray-500 dark:text-gray-400"
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">JPG, PNG (max 2MB)</p>
                  {library.library_image && !newImageFile && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Image actuelle conservée</p>
                  )}
                </div>
              </div>
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de la bibliothèque *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-600 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="tel"
                  value={formData.library_phone}
                  onChange={(e) => setFormData({ ...formData, library_phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-600 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse *</label>
              <input
                type="text"
                value={formData.adress}
                onChange={(e) => setFormData({ ...formData, adress: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-600 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none text-gray-900 dark:text-white"
              />
            </div>

            {/* Durée d'emprunt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Durée d'emprunt (en jours)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={formData.loan_duration}
                  onChange={(e) => setFormData({ ...formData, loan_duration: parseInt(e.target.value) || 14 })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-600 text-gray-900 dark:text-white"
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Nombre de jours maximum pour emprunter un livre</p>
            </div>

            {/* Pénalité par jour */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pénalité par jour de retard (FCFA)</label>
              <div className="relative">
                <AlertCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="number"
                  min="0"
                  max="10000"
                  step="100"
                  value={formData.daily_penalty_amount}
                  onChange={(e) => setFormData({ ...formData, daily_penalty_amount: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-600 text-gray-900 dark:text-white"
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Montant à payer par jour de retard (en FCFA)</p>
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-orange-600 dark:bg-orange-500 text-white rounded-xl hover:bg-orange-700 dark:hover:bg-orange-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Image */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="w-full h-48 bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                {library.library_image ? (
                  <img 
                    src={`/storage/${library.library_image}`} 
                    alt={library.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <LibraryIcon className="w-16 h-16 text-orange-300 dark:text-orange-500" />
                )}
              </div>
            </div>

            {/* Informations générales */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <LibraryIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{library.name}</h2>
                  <div className="flex items-center gap-2 mt-1 text-gray-500 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{library.adress}</span>
                  </div>
                  {library.library_phone && (
                    <div className="flex items-center gap-2 mt-1 text-gray-500 dark:text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span>{library.library_phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {library.description && (
                <div className="flex items-start gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{library.description}</p>
                </div>
              )}
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Livres disponibles</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{booksCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Membres inscrits</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{library.members_count || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Durée d'emprunt</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{library.loan_duration || 14} jours</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pénalité / jour</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{library.daily_penalty_amount || 0} FCFA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}