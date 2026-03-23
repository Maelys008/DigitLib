import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useRef , useEffect } from 'react';
import { ArrowLeft, Camera, Check, Mail, Phone, Lock, Trash2, Save } from 'lucide-react';
import { router } from '@inertiajs/react';
import { currentUser } from '../data/mockData';

export default function EditProfile() {
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    nom: currentUser.nom,
    telephone: currentUser.telephone || '',
    email: currentUser.email,
  });
  const fileInputRef = useRef(null);
	 useEffect(() => {
    const savedPhoto = localStorage.getItem('userPhoto');
    if (savedPhoto) {
      setProfileImage(savedPhoto);
    }
  }, []);
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

const handleSave = () => {
  const updatedUser = {
    nom: formData.nom,
    telephone: formData.telephone,
    email: formData.email,
    photo: profileImage 
  };
  
  console.log('Données sauvegardées:', updatedUser);
  localStorage.setItem('userPhoto', profileImage || '');
  localStorage.setItem('userNom', formData.nom);
  localStorage.setItem('userTelephone', formData.telephone);
  currentUser.nom = formData.nom;
  currentUser.telephone = formData.telephone;
  currentUser.photo = profileImage;
  router.visit('/profile');
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
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div 
              onClick={handleImageClick}
              className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-3xl font-bold shadow-lg cursor-pointer hover:opacity-90 transition-opacity border-4 border-white"
            >
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                getInitials(formData.nom)
              )}
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
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="+229 XX XX XX XX"
              />
            </div>
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
            className="w-full bg-purple-600 text-white font-semibold py-4 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mt-6"
          >
            <Save className="w-5 h-5" />
            Enregistrer
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}