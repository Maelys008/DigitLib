import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({ email: '', password: '' });
    
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
    // Simuler connexion
    setTimeout(() => {
      setIsLoading(false);
      router.visit('/');
    }, 1000);
  };

  const handleSkip = () => {
    router.visit('/');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Bouton Passer */}
      <div className="flex justify-end px-6 pt-6">
        <button 
          onClick={handleSkip}
          className="text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
        >
          Passer
        </button>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-20">
        {/* Titre */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bienvenue !</h1>
          <p className="text-gray-500 text-sm">
            Entrez votre email et mot de passe
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Champ Email */}
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                className={`w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-all ${
                  errors.email ? 'border border-red-500 ring-1 ring-red-500' : ''
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Champ Mot de passe */}
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className={`w-full pl-12 pr-12 py-4 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-all ${
                  errors.password ? 'border border-red-500 ring-1 ring-red-500' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

         {/* Mot de passe oublié */}
        <div className="text-right">
        <button 
            type="button" 
            onClick={() => router.visit('/forgot-password')}
            className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
        >
            Mot de passe oublié ?
        </button>
        </div>

          {/* Bouton Connexion */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white font-semibold py-4 rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Séparateur */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">Ou connectez-vous avec</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

         {/* Boutons sociaux */}
            <div className="flex justify-between gap-3 mb-8">
                <button className="flex-1 h-14 bg-[#F5F5F5] rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <span className="text-2xl font-bold">f</span>
                </button>
                
                <button className="flex-1 h-14 bg-[#F5F5F5] rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <span className="text-2xl font-bold">G</span>
                </button>
                
                <button className="flex-1 h-14 bg-[#F5F5F5] rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 384 512">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                    </svg>
                </button>
            </div>

        {/* Lien inscription */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => router.visit('/register')}
            className="text-gray-900 font-medium"
          >
            Pas de compte ? S'inscrire
          </button>
        </div>
      </div>
    </div>
  );
}