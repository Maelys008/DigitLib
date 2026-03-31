import { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, Camera, MapPin, FileText, Users, BookOpen, Save, X, Library as LibraryIcon } from 'lucide-react';
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
  
  const [formData, setFormData] = useState({
    name: '',
    adress: '',
    description: ''
  });

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const data = await api.getLibrary(id);
        setLibrary(data);
        setFormData({
          name: data.name || '',
          adress: data.adress || '',
          description: data.description || ''
        });
        if (data.library_image) {
          setImagePreview(`/storage/${data.library_image}`);
        }
      } catch (error) {
        console.error('Erreur chargement bibliothèque:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLibrary();
  }, [id]);

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
    formDataToSend.append('description', formData.description);
    if (newImageFile) {
      formDataToSend.append('library_image', newImageFile);
    }

    const result = await api.updateLibrary(id, formDataToSend);
    
    if (result.success) {
      setIsEditing(false);
      // Rafraîchir les données
      const updatedLibrary = await api.getLibrary(id);
      setLibrary(updatedLibrary);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!library) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Bibliothèque non trouvée</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Détails de la bibliothèque</h1>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" /> Modifier
            </button>
          )}
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        {isEditing ? (
          /* Formulaire d'édition */
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image de la bibliothèque</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Bibliothèque" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-sm text-gray-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG (max 2MB)</p>
                </div>
              </div>
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la bibliothèque *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
              <input
                type="text"
                value={formData.adress}
                onChange={(e) => setFormData({ ...formData, adress: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none"
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        ) : (
          /* Affichage des détails */
          <div className="space-y-6">
            {/* Image */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="w-full h-48 bg-purple-100 flex items-center justify-center">
                {library.library_image ? (
                  <img 
                    src={`/storage/${library.library_image}`} 
                    alt={library.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <LibraryIcon className="w-16 h-16 text-purple-300" />
                )}
              </div>
            </div>

            {/* Informations */}
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <LibraryIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{library.name}</h2>
                  <div className="flex items-center gap-2 mt-1 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{library.adress}</span>
                  </div>
                </div>
              </div>

              {library.description && (
                <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
                  <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600 leading-relaxed">{library.description}</p>
                </div>
              )}

              <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
                <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Membres</p>
                  <p className="text-gray-500">{library.members_count || 0} membres inscrits</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}