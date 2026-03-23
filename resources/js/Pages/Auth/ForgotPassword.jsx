import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
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
    
    // Vérifier si l'email existe dans localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = users.some(u => u.email === email);
    
    setTimeout(() => {
      setIsLoading(false);
      if (userExists) {
        setIsSent(true);
      } else {
        setErrors({ email: 'Aucun compte associé à cet email' });
      }
    }, 1000);
  };

  const handleBack = () => {
    router.visit('/login');
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
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mot de passe oublié ?</h1>
          <p className="text-gray-500 text-sm">
            Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  className={`w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black ${
                    errors.email ? 'border border-red-500 ring-1 ring-red-500' : ''
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white font-semibold py-4 rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            >
              {isLoading ? 'Envoi...' : 'Envoyer le lien'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email envoyé !</h2>
            <p className="text-gray-500 text-sm mb-6">
              Un lien de réinitialisation a été envoyé à <strong>{email}</strong>
            </p>
            <button
              onClick={handleBack}
              className="text-black font-medium"
            >
              Retour à la connexion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}