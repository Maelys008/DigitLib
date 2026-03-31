import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../../services/api';

export default function BorrowButton({ 
  bookId,
  isAuthenticated,
  className = '' 
}) {
  const [isBorrowed, setIsBorrowed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Vérifier si le livre est déjà emprunté
  useEffect(() => {
    const checkIfAlreadyBorrowed = async () => {
      if (!isAuthenticated) return;
      
      try {
        const loans = await api.getLoans();
        const alreadyBorrowed = loans.some(loan => loan.copy?.book?.id === bookId);
        setIsBorrowed(alreadyBorrowed);
      } catch (error) {
        console.error('Erreur vérification emprunt:', error);
      }
    };
    
    checkIfAlreadyBorrowed();
  }, [bookId, isAuthenticated]);

  const handleClick = async () => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      router.visit('/login');
      return;
    }

    if (isBorrowed) {
      setErrorMessage('Vous avez déjà emprunté ce livre');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const result = await api.borrowBook(bookId);
      
      if (result.success) {
        setIsBorrowed(true);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setErrorMessage(result.message);
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      setErrorMessage('Une erreur est survenue');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
    if (result.status === 403) {
  setErrorMessage('Vous devez rejoindre la bibliothèque avant d\'emprunter');
  // Scroll vers le haut pour montrer le message
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
  };

  return (
    <div className="relative mb-6">
      {errorMessage && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="mb-3 bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">Livre emprunté avec succès !</p>
          </div>
        </div>
      )}
      
      <button
        onClick={handleClick}
        disabled={isBorrowed || isLoading}
        className={`
          w-full font-semibold py-4 rounded-xl transition-all shadow-md
          ${isBorrowed 
            ? 'bg-green-100 text-green-700 border border-green-200 cursor-not-allowed' 
            : 'bg-gray-900 text-white hover:bg-gray-700 active:scale-95'
          }
          ${className}
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Traitement...
          </span>
        ) : isBorrowed ? (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Déjà emprunté
          </span>
        ) : (
          'Emprunter ce livre'
        )}
      </button>
    </div>
  );
}