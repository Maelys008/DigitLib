import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Home } from 'lucide-react';
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
  
  // États pour le modal de choix Super Admin
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  // Vérifier si on vient du callback Google avec Super Admin
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSuperAdmin = urlParams.get('super_admin') === 'true';
    
    if (isSuperAdmin) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.is_super_admin) {
            setPendingUser(user);
            setShowChoiceModal(true);
            window.history.replaceState({}, '', window.location.pathname);
          }
        } catch (e) {
          console.error('Erreur parsing user:', e);
        }
      }
    }
  }, []);

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
    
    console.log('🔍 Result complet:', result);
    console.log('🔍 is_super_admin:', result.user?.is_super_admin);
    
    if (result.success) {
      if (result.user && result.user.is_super_admin === true) {
        setPendingUser(result.user);
        setShowChoiceModal(true);
      } else {
        const redirectUrl = localStorage.getItem('redirectAfterLogin');
        localStorage.removeItem('redirectAfterLogin');
        router.visit(redirectUrl || '/');
      }
    } else {
      setApiError(result.message);
    }
  };
  
  const handleChoice = (choice) => {
    setShowChoiceModal(false);
    localStorage.removeItem('redirectAfterLogin');
    
    if (choice === 'super-admin') {
        const token = localStorage.getItem('auth_token');
        window.location.href = `/super-admin/dashboard?token=${token}`;
    } else {
        router.visit('/');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Bouton Passer en haut à droite */}
      <div className="flex justify-end px-8 pt-6">
        <button 
          onClick={handleSkip}
          className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          Passer
        </button>
      </div>

      {/* Conteneur principal centré */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        {/* Carte modale */}
        <div className="w-full max-w-md">
          {/* Logo / Brand */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
              <img src={logo} alt="DigiLib Logo" className="w-14 h-14 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">DigiLib</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Bibliothèque numérique</p>
          </div>

          {/* Carte de connexion */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connexion</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Entrez vos identifiants pour accéder à votre compte
              </p>
            </div>

            {apiError && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Champ Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    className={`w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                      errors.email ? 'ring-2 ring-red-500' : ''
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Champ Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                      errors.password ? 'ring-2 ring-red-500' : ''
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
                  className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Bouton Connexion */}
              <button
                type="submit"
                disabled={isLoading || isSocialLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-orange-500/30"
              >
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </form>

            {/* Séparateur */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-gray-400 dark:text-gray-500 text-sm">Ou</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Bouton Google */}
            <button 
              onClick={handleGoogleLogin}
              disabled={isSocialLoading}
              className="w-full flex items-center justify-center gap-3 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {isSocialLoading ? 'Connexion...' : 'Continuer avec Google'}
              </span>
            </button>

            {/* Lien inscription */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pas encore de compte ?{' '}
                <button 
                  onClick={() => router.visit('/register')}
                  className="text-orange-600 dark:text-orange-400 font-semibold hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                >
                  S'inscrire
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de choix pour Super Admin */}
      {showChoiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                🎯 Mode de connexion
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Vous êtes connecté en tant que <strong>Super Admin</strong>.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Où souhaitez-vous aller ?
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleChoice('super-admin')}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-3"
              >
                <ShieldCheck className="w-5 h-5" />
                Dashboard Super Admin
              </button>
              
              <button
                onClick={() => handleChoice('reader')}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-3"
              >
                <Home className="w-5 h-5" />
                Interface Lecteur
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
              Vous pouvez changer de mode à tout moment depuis les paramètres
            </p>
          </div>
        </div>
      )}
    </div>
  );
}