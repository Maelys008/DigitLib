import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../../services/api';
import logo from '../../../images/logo .png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!email) {
      setErrors({ email: 'Veuillez entrer votre email' });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ email: 'Veuillez entrer un email valide' });
      return;
    }
    
    setIsLoading(true);
    
    // Appel API pour mot de passe oublié
    const result = await api.forgotPassword(email);
    
    setIsLoading(false);
    
    if (result.success) {
      setIsSent(true);
    } else {
      setErrors({ email: result.message });
    }
  };

  const handleBack = () => {
    router.visit('/login');
  };

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mot de passe oublié ?</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  className={`w-full pl-12 pr-4 py-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500 ${
                    errors.email ? 'border border-red-500 ring-1 ring-red-500' : ''
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-orange-500/30"
            >
              {isLoading ? 'Envoi...' : 'Envoyer le lien'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email envoyé !</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Un lien de réinitialisation a été envoyé à <strong className="text-orange-600 dark:text-orange-400">{email}</strong>
            </p>
            <button
              onClick={handleBack}
              className="text-orange-600 dark:text-orange-400 font-medium hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
            >
              Retour à la connexion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}