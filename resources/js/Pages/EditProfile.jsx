import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Check, Mail, Phone, Lock, Trash2, Save, User } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function EditProfile() {
  const { user: authUser } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tel: '',
    email: '',
  });
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const profileData = await api.getProfile();
      if (profileData) {
        setFormData({
          name: profileData.user.name || '',
          tel: profileData.user.tel || '',
          email: profileData.user.email || '',
        });
      }
      
      // Récupérer la photo avec l'ID de l'utilisateur
      if (authUser?.id) {
        const savedPhoto = localStorage.getItem(`userPhoto_${authUser.id}`);
        if (savedPhoto) {
          setProfileImage(savedPhoto);
        }
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  const getInitials = (name) => {
    if (!name || name.trim() === '') return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && authUser?.id) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        // Stocker avec l'ID de l'utilisateur
        localStorage.setItem(`userPhoto_${authUser.id}`, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

const handleSave = async () => {
    if (!shelfName.trim()) return;
    
    setIsSubmitting(true);
    
    try {
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('name', shelfName);
        if (shelfDescription) formData.append('description', shelfDescription);
        
        // CORRECTION : envoyer 'shelf_image'
        if (fileInputRef.current.files[0]) {
            formData.append('shelf_image', fileInputRef.current.files[0]);
        }
        
        await api.updateShelf(id, formData);
        
        // Gestion des livres...
        const currentBookIds = currentBooks.map(b => b.id);
        const selectedBookIds = selectedBooks.map(b => b.id);
        
        const toRemove = currentBookIds.filter(id => !selectedBookIds.includes(id));
        for (const bookId of toRemove) {
            await api.removeBookFromShelf(id, bookId);
        }
        
        const toAdd = selectedBookIds.filter(id => !currentBookIds.includes(id));
        for (const bookId of toAdd) {
            await api.addBookToShelf(id, bookId);
        }
        
        router.visit(`/shelves/${id}`);
    } catch (error) {
        console.error('Erreur sauvegarde:', error);
    } finally {
        setIsSubmitting(false);
    }
};
  const handleChangePassword = () => {
    router.visit('/profile/change-password');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      console.log('Compte supprimé');
      router.visit('/');
    }
  };

  const renderAvatar = () => {
    if (profileImage) {
      return (
        <img 
          src={profileImage} 
          alt="Profile" 
          className="w-full h-full object-cover"
        />
      );
    }
    
    if (formData.name && formData.name.trim() !== '') {
      return getInitials(formData.name);
    }
    
    return <User className="w-10 h-10 text-white" />;
  };

  return (
    <MobileLayout>
      <div className="px-6 py-4">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.visit('/profile')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Éditer le profil</h1>
        </div>
        
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {errors.general}
          </div>
        )}
        
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div 
              onClick={handleImageClick}
              className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-3xl font-bold shadow-lg cursor-pointer hover:opacity-90 transition-opacity border-4 border-white overflow-hidden"
            >
              {renderAvatar()}
            </div>
            <button 
              onClick={handleImageClick}
              className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">Cliquez pour changer votre photo</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom et prénom
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Votre nom"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="tel"
                value={formData.tel}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                  errors.tel ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="+229 XX XX XX XX"
              />
            </div>
            {errors.tel && <p className="text-red-500 text-xs mt-1">{errors.tel}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full pl-10 pr-12 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
              />
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            </div>
            <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié</p>
          </div>
          
          <button
            onClick={handleChangePassword}
            className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Lock className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700 font-medium">Changer le mot de passe</span>
          </button>
          
          <button
            onClick={handleDeleteAccount}
            className="w-full flex items-center gap-3 p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
            <span className="text-red-600 font-medium">Supprimer le compte</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full bg-purple-600 text-white font-semibold py-4 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mt-6 disabled:bg-gray-400"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}