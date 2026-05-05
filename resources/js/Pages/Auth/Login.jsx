import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import logo from '../../../images/logo .png';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ email: '', password: '' });
    setApiError('');
    
    let hasError = false;
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Veuillez remplir ce champ' }));
      hasError = true;
    }
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Veuillez remplir ce champ' }));
      hasError = true;
    }
    
    if (hasError) return;
    
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    
    if (result.success) {
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      localStorage.removeItem('redirectAfterLogin');
      router.visit(redirectUrl || '/');
    } else {
      setApiError(result.message);
    }
  };

  const handleSkip = () => {
    router.visit('/');
  };

  const handleGoogleLogin = async () => {
    setIsSocialLoading(true);
    try {
      const result = await api.getGoogleRedirectUrl();
      if (result) {
        window.location.href = result;
      } else {
        setApiError('Erreur lors de la connexion avec Google');
        setIsSocialLoading(false);
      }
    } catch (error) {
      console.error('Erreur Google login:', error);
      setApiError('Erreur lors de la connexion avec Google');
      setIsSocialLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Bouton Passer */}
      <div className="flex justify-end px-6 pt-6">
        <button 
          onClick={handleSkip}
          className="text-gray-400 dark:text-gray-500 text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          Passer
        </button>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-20">
        {/* Logo et Titre */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
            <img src={logo} alt="DigiLib Logo" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bienvenue !</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Entrez votre email et mot de passe
          </p>
        </div>

        {apiError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {apiError}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Champ Email */}
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                className={`w-full pl-12 pr-4 py-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:focus:ring-orange-500 transition-all ${
                  errors.email ? 'border border-red-500 ring-1 ring-red-500' : ''
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Champ Mot de passe */}
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className={`w-full pl-12 pr-12 py-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:focus:ring-orange-500 transition-all ${
                  errors.password ? 'border border-red-500 ring-1 ring-red-500' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Mot de passe oublié */}
          <div className="text-right">
            <button 
              type="button" 
              onClick={() => router.visit('/forgot-password')}
              className="text-gray-500 dark:text-gray-400 text-sm hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              Mot de passe oublié ?
            </button>
          </div>

          {/* Bouton Connexion */}
          <button
            type="submit"
            disabled={isLoading || isSocialLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-orange-500/30"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Séparateur */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-gray-400 dark:text-gray-500 text-sm">Ou connectez-vous avec</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Bouton Google */}
        <div className="flex justify-center mb-8">
          <button 
            onClick={handleGoogleLogin}
            disabled={isSocialLoading}
            className="w-full max-w-xs h-14 bg-[#F5F5F5] dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {isSocialLoading ? 'Connexion...' : 'Continuer avec Google'}
            </span>
          </button>
        </div>

        {/* Lien inscription */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => router.visit('/register')}
            className="text-orange-600 dark:text-orange-400 font-medium hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
          >
            Pas de compte ? S'inscrire
          </button>
        </div>
      </div>
    </div>
  );
}