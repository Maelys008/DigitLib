import { useState, useRef } from 'react';
import { ArrowLeft, Building, CheckCircle, Camera, X } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function CreateLibrary() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    adress: '',
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
    router.visit('/settings');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center px-6 pt-6 pb-4 border-b border-gray-100">
        <button 
          onClick={handleBack}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-2">Créer une bibliothèque</h1>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Créez votre bibliothèque
              </h2>
              <p className="text-gray-500 text-sm">
                Devenez bibliothécaire et gérez votre propre espace de lecture
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image de la bibliothèque
              </label>
              <div 
                onClick={handleImageClick}
                className="relative w-32 h-32 mx-auto bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors"
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Bibliothèque" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
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
              <p className="text-xs text-gray-400 text-center mt-2">
                JPG, PNG ou GIF (max 2MB)
              </p>
            </div>

            {/* Nom de la bibliothèque */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la bibliothèque
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Bibliothèque municipale de..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <input
                type="text"
                value={formData.adress}
                onChange={(e) => setFormData({ ...formData, adress: e.target.value })}
                placeholder="123 rue de la bibliothèque, ville"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Décrivez votre bibliothèque..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
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
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bibliothèque créée !
            </h2>
            <p className="text-gray-500 mb-6">
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