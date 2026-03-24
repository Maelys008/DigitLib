// resources/js/Pages/Auth/VerifyIdentity.jsx

import { useState, useEffect } from 'react';
import { Phone, CreditCard, AlertCircle, ArrowLeft, User } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function VerifyIdentity() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+229');
  const [anipId, setAnipId] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer l'email stocké
  const [email, setEmail] = useState('');

  useEffect(() => {
    const tempUser = JSON.parse(localStorage.getItem('tempUser') || '{}');
    setEmail(tempUser.email || '');
  }, []);

  const handlePhoneChange = (value) => {
    if (!value.startsWith('+229')) {
      setPhone('+229');
      return;
    }
    if (value.length <= 14) {
      setPhone(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Veuillez remplir ce champ';
    }
    
    const phoneDigits = phone.replace('+229', '');
    if (!phone || phoneDigits.length !== 10 || !/^\d+$/.test(phoneDigits)) {
      newErrors.phone = 'Veuillez entrer un numéro valide (10 chiffres après +229)';
    }
    
    if (!anipId || anipId.length < 10) {
      newErrors.anipId = 'Veuillez entrer un numéro ANIP valide';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    // Récupérer les données existantes et ajouter le nom
    const tempUser = JSON.parse(localStorage.getItem('tempUser') || '{}');
    const completeUser = {
      ...tempUser,
      name: name,
      phone: phone,
      anipId: anipId
    };
    localStorage.setItem('tempUser', JSON.stringify(completeUser));
    
    // Simuler envoi OTP
    setTimeout(() => {
      setIsLoading(false);
      router.visit('/verify/otp');
    }, 1000);
  };

  const handleBack = () => {
    router.visit('/register');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center px-6 pt-6">
        <button onClick={handleBack} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-20">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vérifiez votre identité</h1>
          <p className="text-gray-500 text-sm">
            Pour finaliser votre inscription, veuillez fournir vos informations
          </p>
        </div>

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
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont"
                className={`w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.name ? 'border border-red-500 ring-1 ring-red-500' : ''
                }`}
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Numéro de téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Numéro de téléphone
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+229 90 12 34 56 78"
                className={`w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.phone ? 'border border-red-500 ring-1 ring-red-500' : ''
                }`}
              />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            <p className="text-gray-400 text-xs mt-1">Un code sera envoyé à ce numéro</p>
          </div>

          {/* Numéro ANIP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Numéro ANIP
            </label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={anipId}
                onChange={(e) => setAnipId(e.target.value)}
                placeholder="Numéro sur votre carte ANIP"
                className={`w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.anipId ? 'border border-red-500 ring-1 ring-red-500' : ''
                }`}
              />
            </div>
            {errors.anipId && <p className="text-red-500 text-xs mt-1">{errors.anipId}</p>}
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
            {isLoading ? 'Envoi...' : 'Envoyer le code'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Vos données sont sécurisées et ne seront jamais partagées
        </p>
      </div>
    </div>
  );
}