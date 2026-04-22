import { Calendar, User, BookOpen, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function LoanCard({ 
  loan, 
  type = 'loan', // 'loan' ou 'reservation'
  reservation = null,
  onReturn,
  onConfirmPickup, 
  className = '' 
}) {
  const [isReturning, setIsReturning] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleReturn = (e) => {
    e.stopPropagation();
    if (onReturn) {
      onReturn(loan);
    }
  };

  const handleConfirmPickup = async (e) => {
    e.stopPropagation();
    if (onConfirmPickup && loan.status === 'pending_pickup') {
      setIsConfirming(true);
      await onConfirmPickup(loan);
      setIsConfirming(false);
    }
  };

  // Calculer les jours restants ou de retard
  const getDaysStatus = (expectedReturnDate) => {
    const today = new Date();
    const expected = new Date(expectedReturnDate);
    const diffTime = expected - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `Retard de ${Math.abs(diffDays)}j`, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
    } else if (diffDays <= 3) {
      return { text: `${diffDays}j restants`, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' };
    } else {
      return { text: `${diffDays}j restants`, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' };
    }
  };

  const book = type === 'loan' ? loan.copy?.book : loan.book;
  const user = loan.user;
  const loanDate = type === 'loan' ? loan.loan_date : loan.created_at;
  const expectedDate = type === 'loan' ? loan.expected_return_date : null;
  const status = type === 'reservation' ? loan.status : null;
  const isPendingPickup = type === 'loan' && loan.status === 'pending_pickup';

  const daysInfo = expectedDate ? getDaysStatus(expectedDate) : null;

  return (
    <div 
      className={`
        flex gap-4 bg-white dark:bg-gray-800 rounded-xl p-4
        shadow-sm hover:shadow-md transition-all
        border border-gray-100 dark:border-gray-700
        ${className}
      `}
    >
      {/* Image du livre */}
      <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
        <img 
          src={book?.cover_url || book?.cover_image || '/placeholder-book.jpg'} 
          alt={book?.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/placeholder-book.jpg';
          }}
        />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Titre du livre */}
        <h3 className="font-bold text-gray-900 dark:text-white text-base line-clamp-2 mb-1">
          {book?.title}
        </h3>

        {/* Auteur */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {book?.author || 'Auteur inconnu'}
        </p>

        {/* Informations utilisateur */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
          <User className="w-3 h-3" />
          <span>{user?.name || 'Utilisateur'}</span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <Calendar className="w-3 h-3" />
          <span>
            {type === 'loan' ? 'Emprunté le' : 'Réservé le'} : {new Date(loanDate).toLocaleDateString()}
          </span>
        </div>

        {/* Statut "En attente de retrait" */}
        {isPendingPickup && (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 w-fit mb-3">
            <Clock className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
            <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
              En attente de retrait
            </span>
            {loan.pickup_deadline && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                (avant le {new Date(loan.pickup_deadline).toLocaleString()})
              </span>
            )}
          </div>
        )}

        {/* Date de retour (pour les emprunts actifs) */}
        {type === 'loan' && expectedDate && !isPendingPickup && daysInfo && (
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg ${daysInfo.bg} w-fit mb-3`}>
            <Clock className={`w-3.5 h-3.5 ${daysInfo.color}`} />
            <span className={`text-xs font-medium ${daysInfo.color}`}>
              {daysInfo.text}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              (jusqu'au {new Date(expectedDate).toLocaleDateString()})
            </span>
          </div>
        )}



          {/* Statut de réservation */}
          {type === 'reservation' && status && (
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit mb-3 ${
              status === 'notified' 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-blue-50 dark:bg-blue-900/20'
            }`}>
              {status === 'notified' ? (
                <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              )}
              <span className={`text-xs font-medium ${
                status === 'notified' 
                  ? 'text-green-700 dark:text-green-400 font-semibold' 
                  : 'text-blue-600 dark:text-blue-400'
              }`}>
                {status === 'notified' ? '✅ Livre disponible - À récupérer' : '⏳ En liste d\'attente'}
              </span>
              {status === 'notified' && reservation?.expires_at && (
                <span className="text-xs text-orange-600 dark:text-orange-400 ml-1">
                  (avant {new Date(reservation.expires_at).toLocaleString()})
                </span>
              )}
            </div>
          )}

        {/* Boutons d'action */}
        <div className="flex gap-2 mt-2">
          {/* Bouton Confirmer le retrait (pour les emprunts en attente) */}
          {type === 'loan' && isPendingPickup && onConfirmPickup && (
            <button
              onClick={handleConfirmPickup}
              disabled={isConfirming}
              className="px-4 py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isConfirming ? 'Confirmation...' : 'Confirmer le retrait'}
            </button>
          )}
          
          {/* Bouton Retour (pour les emprunts actifs) */}
          {type === 'loan' && !isPendingPickup && onReturn && (
            <button
              onClick={handleReturn}
              disabled={isReturning}
              className="px-4 py-1.5 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isReturning ? 'Traitement...' : 'Retourner'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}