import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../../services/api';

export default function BorrowButton({ 
  bookId,
  bibliothequeNom,
  isLibraryJoined,
  isAuthenticated,
  onShowWarning,
  onReservationCreated,
  isBookAvailable = true, 
  className = '' 
}) {
  const [showWarning, setShowWarning] = useState(false);
  const [isBorrowed, setIsBorrowed] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReservation, setShowReservation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [reservationMessage, setReservationMessage] = useState('');
  const [maxAllowed, setMaxAllowed] = useState(null);
  const [currentLoans, setCurrentLoans] = useState(null);

  // Vérifier si le livre est déjà emprunté par l'utilisateur
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

    // Vérifier si la bibliothèque est rejointe
    if (!isLibraryJoined) {
      setShowWarning(true);
      if (onShowWarning) {
        onShowWarning(true);
      }
      const joinButton = document.getElementById('join-library-button');
      if (joinButton) {
        joinButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setTimeout(() => setShowWarning(false), 5000);
      return;
    }

    // Vérifier si déjà emprunté
    if (isBorrowed) {
      setErrorMessage('Vous avez déjà un exemplaire de ce livre en votre possession.');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setShowReservation(false);
    
    try {
      const result = await api.borrowBook(bookId);
      
      if (result.success) {
        // Emprunt réussi
        if (!result.isReservation) {
          setIsBorrowed(true);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        } else {
          // Réservation créée
          setIsReserved(true);
          setShowReservation(true);
          setReservationMessage(result.message || 'Aucun exemplaire disponible. Vous avez été ajouté à la liste d\'attente.');
          if (onReservationCreated) {
            onReservationCreated(result.data?.reservation);
          }
          setTimeout(() => setShowReservation(false), 5000);
        }
      } else if (result.status === 403) {
        setErrorMessage(result.message);
        if (result.max_allowed) {
          setMaxAllowed(result.max_allowed);
          setCurrentLoans(result.current_loans);
        }
        setTimeout(() => setErrorMessage(''), 5000);
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
  };

  // Déterminer le texte du bouton
  const getButtonText = () => {
    if (isLoading) return 'Traitement...';
    if (isBorrowed) return 'Déjà emprunté';
    if (isReserved) return 'En liste d\'attente';
    
    if (!isBookAvailable && isLibraryJoined) return 'Réserver';
    return 'Emprunter ce livre';
  };

  // Déterminer le style du bouton
  const getButtonStyle = () => {
    if (isBorrowed) {
      return 'bg-green-100 text-green-700 border border-green-200 cursor-not-allowed';
    }
    if (isReserved) {
      return 'bg-blue-100 text-blue-700 border border-blue-200 cursor-not-allowed';
    }
    if (!isBookAvailable && isLibraryJoined) {
      return 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'; // Orange pour réserver
    }
    if (isLibraryJoined) {
      return 'bg-gray-900 text-white hover:bg-gray-700 active:scale-95';
    }
    return 'bg-gray-200 text-gray-500 hover:bg-gray-300 cursor-pointer';
  };

  // Déterminer si le bouton est désactivé
  const isDisabled = () => {
    return isBorrowed || isLoading || isReserved;
  };

  return (
    <div className="relative mb-6">
      {/* Message d'erreur */}
      {errorMessage && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Emprunt impossible</p>
              <p className="text-xs text-red-600 mt-0.5">{errorMessage}</p>
              {maxAllowed && currentLoans && (
                <p className="text-xs text-red-500 mt-1">
                  Limite: {maxAllowed} livre(s) | Emprunts en cours: {currentLoans}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message de réservation */}
      {showReservation && (
        <div className="mb-3 bg-blue-50 border border-blue-200 rounded-xl p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">En liste d'attente</p>
              <p className="text-xs text-blue-600 mt-0.5">{reservationMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Message de succès */}
      {showSuccess && (
        <div className="mb-3 bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">
              Livre emprunté avec succès !
            </p>
          </div>
        </div>
      )}
      
      <button
        onClick={handleClick}
        disabled={isDisabled()}
        className={`w-full font-semibold py-4 rounded-xl transition-all shadow-md ${getButtonStyle()} ${className}`}
      >
        {getButtonText()}
      </button>
    </div>
  );
}