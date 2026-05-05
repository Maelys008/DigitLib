import { useState, useEffect } from 'react';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import api from '../../services/api';
import logo from '../../../images/logo .png';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Récupérer les paramètres de l'URL de plusieurs façons
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const pathParts = window.location.pathname.split('/');
      
      // Essayer de récupérer le token depuis les paramètres GET
      let tokenParam = urlParams.get('token');
      let emailParam = urlParams.get('email');
      
      // Si le token n'est pas dans les params, essaye de le prendre depuis l'URL (ex: /reset-password/TOKEN_ICI)
      if (!tokenParam && pathParts.length > 2) {
        tokenParam = pathParts[pathParts.length - 1];
      }
      
      console.log('URL complète:', window.location.href);
      console.log('Token reçu:', tokenParam);
      console.log('Email reçu:', emailParam);
      
      if (tokenParam) {
        setToken(tokenParam);
        // Si l'email n'est pas dans l'URL, on le demande à l'utilisateur
        if (emailParam) {
          setEmail(emailParam);
        }
      } else {
        setErrors({ general: 'Lien de réinitialisation invalide. Veuillez refaire une demande.' });
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    let hasError = false;
    
    // Si l'email n'a pas été récupéré de l'URL, on le demande
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Veuillez entrer votre email' }));
      hasError = true;
    }
    
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Le mot de passe est requis' }));
      hasError = true;
    } else if (password.length < 8) {
      setErrors(prev => ({ ...prev, password: 'Le mot de passe doit contenir au moins 8 caractères' }));
      hasError = true;
    }
    
    if (!passwordConfirmation) {
      setErrors(prev => ({ ...prev, passwordConfirmation: 'Veuillez confirmer le mot de passe' }));
      hasError = true;
    } else if (password !== passwordConfirmation) {
      setErrors(prev => ({ ...prev, passwordConfirmation: 'Les mots de passe ne correspondent pas' }));
      hasError = true;
    }
    
    if (hasError) return;
    
    setIsLoading(true);
    
    try {
      console.log('Envoi réinitialisation:', { email, token });
      const result = await api.resetPassword(email, password, passwordConfirmation, token);
      
      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.visit('/login');
        }, 3000);
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      console.error('Reset error:', error);
      setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.visit('/login');
  };

  // Si pas de token du tout
  if (!token && errors.general) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
              <img src={logo} alt="DigiLib Logo" className="w-14 h-14 object-contain" />
            </div>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lien invalide</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              {errors.general}
            </p>
            <button
              onClick={() => router.visit('/forgot-password')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-orange-500/30"
            >
              Nouvelle demande
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
              <img src={logo} alt="DigiLib Logo" className="w-14 h-14 object-contain" />
            </div>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mot de passe réinitialisé !</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Votre mot de passe a été modifié avec succès.
            </p>
            <button
              onClick={handleBack}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-orange-500/30"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <div className="flex items-center px-6 pt-6">
        <button onClick={handleBack} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-20">
        {/* Logo et Titre */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
            <img src={logo} alt="DigiLib Logo" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Nouveau mot de passe</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Créez un nouveau mot de passe pour votre compte
          </p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-sm">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Champ email visible seulement si non récupéré */}
          {!email && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full px-4 py-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500"
              />
              {errors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 8 caractères"
                autoComplete="new-password"
                className={`w-full pl-12 pr-12 py-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500 ${
                  errors.password ? 'border border-red-500 ring-1 ring-red-500' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-5 h-5 text-gray-400 dark:text-gray-500" /> : <Eye className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Répétez le mot de passe"
                autoComplete="new-password"
                className={`w-full pl-12 pr-12 py-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500 ${
                  errors.passwordConfirmation ? 'border border-red-500 ring-1 ring-red-500' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-400 dark:text-gray-500" /> : <Eye className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
              </button>
            </div>
            {errors.passwordConfirmation && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.passwordConfirmation}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-orange-500/30"
          >
            {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}