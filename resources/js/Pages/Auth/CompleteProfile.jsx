// resources/js/Pages/Auth/CompleteProfile.jsx

import { useState, useEffect } from 'react';
import { User, Phone, CreditCard, AlertCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function CompleteProfile() {
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    tel: '',
    identityHash: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handlePhoneChange = (value) => {
    if (!value.startsWith('+229')) {
      setFormData(prev => ({ ...prev, tel: '+229' }));
      return;
    }
    if (value.length <= 14) {
      setFormData(prev => ({ ...prev, tel: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Veuillez remplir ce champ';
    
    const phoneDigits = formData.tel.replace('+229', '');
    if (!formData.tel || phoneDigits.length !== 10 || !/^\d+$/.test(phoneDigits)) {
      newErrors.tel = 'Veuillez entrer un numéro valide (10 chiffres après +229)';
    }
    
    if (!formData.identityHash || formData.identityHash.length < 10) {
      newErrors.identityHash = 'Veuillez entrer un numéro ANIP valide';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    setApiError('');
    
    const result = await api.completeProfile(
      formData.name,
      formData.tel,
      formData.identityHash
    );
    
    setIsLoading(false);
    
    if (result.success) {
      updateUser(result.user);
      router.visit('/');
    } else {
      setApiError(result.message);
    }
  };

  const handleSkip = () => {
    router.visit('/');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex justify-end px-6 pt-6">
        <button 
          onClick={handleSkip}
          className="text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
        >
          Passer
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-20">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complétez votre profil</h1>
          <p className="text-gray-500 text-sm">
            Pour finaliser votre inscription, veuillez fournir vos informations
          </p>
        </div>

        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom complet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom complet
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Jean Dupont"
                className={`w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.name ? 'border border-red-500 ring-1 ring-red-500' : ''
                }`}
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Numéro de téléphone
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.tel}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+229 90 12 34 56 78"
                className={`w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.tel ? 'border border-red-500 ring-1 ring-red-500' : ''
                }`}
              />
            </div>
            {errors.tel && <p className="text-red-500 text-xs mt-1">{errors.tel}</p>}
          </div>

          {/* ANIP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Numéro ANIP
            </label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.identityHash}
                onChange={(e) => setFormData(prev => ({ ...prev, identityHash: e.target.value }))}
                placeholder="Numéro sur votre carte ANIP"
                className={`w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.identityHash ? 'border border-red-500 ring-1 ring-red-500' : ''
                }`}
              />
            </div>
            {errors.identityHash && <p className="text-red-500 text-xs mt-1">{errors.identityHash}</p>}
          </div>

          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-semibold mb-1">Pourquoi ces informations ?</p>
                <p>La vérification garantit la sécurité de tous les utilisateurs et permet une identification fiable pour les emprunts.</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white font-semibold py-4 rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? 'Enregistrement...' : 'Terminer'}
          </button>
        </form>
      </div>
    </div>
  );
}