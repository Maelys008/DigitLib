import { useState, useRef } from 'react';
import { ArrowLeft, Building, CheckCircle, Camera, X, Phone } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function CreateLibrary() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    adress: '',
    library_phone: '',
    description: ''
  });
  const [libraryImage, setLibraryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLibraryImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('adress', formData.adress);
    formDataToSend.append('library_phone', formData.library_phone);
    formDataToSend.append('description', formData.description);
    if (libraryImage) {
      formDataToSend.append('library_image', libraryImage);
    }

    try {
      const response = await api.createLibrary(formDataToSend);

      if (response.success) {
        setSuccess(true);
        const newLibrary = response.data.library;
      
        const key = `user_library_${user.id}`;
        localStorage.setItem(key, JSON.stringify(newLibrary));
        
        updateUser({ ...user, role: 'admin' });
        setTimeout(() => {
          router.visit('/librarian/dashboard');
        }, 2000);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Erreur lors de la création de la bibliothèque');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.visit('/profile/settings');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <div className="flex items-center px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <button 
          onClick={handleBack}
          className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white ml-2">Créer une bibliothèque</h1>
      </div>

      <div className="flex-1 px-6 py-8">
        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
            
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building className="w-10 h-10 text-white" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Créez votre bibliothèque
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Devenez bibliothécaire et gérez votre propre espace de lecture
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image de la bibliothèque
              </label>
              <div 
                onClick={handleImageClick}
                className="relative w-32 h-32 mx-auto bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Bibliothèque" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
                JPG, PNG ou GIF (max 2MB)
              </p>
            </div>

            {/* Nom de la bibliothèque */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom de la bibliothèque *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Bibliothèque municipale de..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                required
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Téléphone *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="tel"
                  value={formData.library_phone}
                  onChange={(e) => setFormData({ ...formData, library_phone: e.target.value })}
                  placeholder="+229 XX XX XX XX"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adresse *
              </label>
              <input
                type="text"
                value={formData.adress}
                onChange={(e) => setFormData({ ...formData, adress: e.target.value })}
                placeholder="123 rue de la bibliothèque, ville"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Décrivez votre bibliothèque..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Bouton de création */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50"
            >
              {isLoading ? 'Création en cours...' : 'Créer ma bibliothèque'}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Bibliothèque créée !
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Félicitations ! Vous êtes maintenant bibliothécaire.
            </p>
            <button
              onClick={() => router.visit('/librarian/dashboard')}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              Accéder au tableau de bord
            </button>
          </div>
        )}
      </div>
    </div>
  );
}