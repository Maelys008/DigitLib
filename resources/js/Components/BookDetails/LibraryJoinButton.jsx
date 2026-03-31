import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../../services/api';

export default function LibraryJoinButton({ 
  bibliothequeNom,
  libraryId,
  onJoin,
  isAuthenticated,
  className = '' 
}) {
  const [isJoining, setIsJoining] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      router.visit('/login');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const result = await api.joinLibrary(libraryId);
      if (result.success) {
        setShowSuccess(true);
        if (onJoin) onJoin();
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError(result.message);
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      setError('Erreur lors de l\'inscription');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="relative">
      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      <button
        onClick={handleJoin}
        disabled={isJoining}
        className={`
          w-full font-medium py-3 rounded-xl transition-all
          bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-md
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {isJoining ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Inscription...
          </span>
        ) : (
          `Rejoindre la bibliothèque "${bibliothequeNom}"`
        )}
      </button>

      {showSuccess && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-green-50 border border-green-200 rounded-xl p-4 shadow-lg animate-fade-in z-10">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Vous avez rejoint la bibliothèque
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                "{bibliothequeNom}" avec succès !
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}