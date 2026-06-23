import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Library, MapPin, Building2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../../services/api';

export default function BorrowButton({ 
  bookId,
  bibliothequeNom,
  bibliothequeAdresse,
  bibliothequeImage,
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

  // Vérifier si le livre est actuellement emprunté (non retourné)
  useEffect(() => {
    const checkIfAlreadyBorrowed = async () => {
      if (!isAuthenticated) return;
      
      try {
        const loans = await api.getLoans();
        const activeLoans = loans.filter(loan => !loan.actual_return_date);
        const alreadyBorrowed = activeLoans.some(loan => loan.copy?.book?.id === bookId);
        
        console.log('Emprunts actifs:', activeLoans.length);
        console.log('Livre déjà emprunté (actif)?', alreadyBorrowed);
        
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

    // Vérifier si déjà emprunté (actif)
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
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 cursor-not-allowed';
    }
    if (isReserved) {
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 cursor-not-allowed';
    }
    if (!isBookAvailable && isLibraryJoined) {
      return 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95';
    }
    if (isLibraryJoined) {
      return 'bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600 active:scale-95';
    }
    return 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer';
  };

  // Déterminer si le bouton est désactivé
  const isDisabled = () => {
    return isBorrowed || isLoading || isReserved;
  };

  return (
    <div className="relative mb-6">
      {/* 🔥 CARTE DE LA BIBLIOTHÈQUE */}
      {bibliothequeNom && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 rounded-2xl p-4 mb-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Library className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                  Bibliothèque
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {bibliothequeNom}
              </p>
              {bibliothequeAdresse && (
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {bibliothequeAdresse}
                  </p>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}

      {/* Message d'avertissement (bibliothèque non rejointe) */}
      {showWarning && (
        <div className="mb-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                Vous devez rejoindre la bibliothèque
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                "{bibliothequeNom}" avant d'emprunter un livre
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {errorMessage && (
        <div className="mb-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Emprunt impossible</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{errorMessage}</p>
              {maxAllowed && currentLoans && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  Limite: {maxAllowed} livre(s) | Emprunts en cours: {currentLoans}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message de réservation */}
      {showReservation && (
        <div className="mb-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">En liste d'attente</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{reservationMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Message de succès */}
      {showSuccess && (
        <div className="mb-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
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