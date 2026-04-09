import { Calendar, User, BookOpen, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function LoanCard({ 
  loan, 
  type = 'loan',
  onReturn,
  className = '' 
}) {
  const [isReturning, setIsReturning] = useState(false);

  const handleReturn = (e) => {
    e.stopPropagation();
    if (onReturn) {
      onReturn(loan);
    }
  };

  // Calculer les jours restants ou de retard
  const getDaysStatus = (expectedReturnDate) => {
    const today = new Date();
    const expected = new Date(expectedReturnDate);
    const diffTime = expected - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `Retard de ${Math.abs(diffDays)}j`, color: 'text-red-600', bg: 'bg-red-50' };
    } else if (diffDays <= 3) {
      return { text: `${diffDays}j restants`, color: 'text-orange-600', bg: 'bg-orange-50' };
    } else {
      return { text: `${diffDays}j restants`, color: 'text-green-600', bg: 'bg-green-50' };
    }
  };

  const book = type === 'loan' ? loan.copy?.book : loan.book;
  const user = loan.user;
  const loanDate = type === 'loan' ? loan.loan_date : loan.created_at;
  const expectedDate = type === 'loan' ? loan.expected_return_date : null;
  const status = type === 'reservation' ? loan.status : null;

  const daysInfo = expectedDate ? getDaysStatus(expectedDate) : null;
e 
  return (
    <div 
      className={`
        flex gap-4 bg-white rounded-xl p-4
        shadow-sm hover:shadow-md transition-all
        border border-gray-100
        ${className}
      `}
    >
      {/* Image du livre */}
      <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
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
        <h3 className="font-bold text-gray-900 text-base line-clamp-2 mb-1">
          {book?.title}
        </h3>

        {/* Auteur */}
        <p className="text-sm text-gray-500 mb-2">
          {book?.author || 'Auteur inconnu'}
        </p>

        {/* Informations utilisateur */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <User className="w-3 h-3" />
          <span>{user?.name || 'Utilisateur'}</span>
          <span className="text-gray-300">•</span>
          <Calendar className="w-3 h-3" />
          <span>
            {type === 'loan' ? 'Emprunté le' : 'Réservé le'} : {new Date(loanDate).toLocaleDateString()}
          </span>
        </div>

        {/* Date de retour (pour les emprunts) */}
        {type === 'loan' && expectedDate && daysInfo && (
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg ${daysInfo.bg} w-fit mb-3`}>
            <Clock className={`w-3.5 h-3.5 ${daysInfo.color}`} />
            <span className={`text-xs font-medium ${daysInfo.color}`}>
              {daysInfo.text}
            </span>
            <span className="text-xs text-gray-500 ml-1">
              (jusqu'au {new Date(expectedDate).toLocaleDateString()})
            </span>
          </div>
        )}

        {/* Statut de réservation */}
        {type === 'reservation' && status && (
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit mb-3 ${
            status === 'notified' ? 'bg-orange-50' : 'bg-blue-50'
          }`}>
            <AlertCircle className={`w-3.5 h-3.5 ${
              status === 'notified' ? 'text-orange-600' : 'text-blue-600'
            }`} />
            <span className={`text-xs font-medium ${
              status === 'notified' ? 'text-orange-600' : 'text-blue-600'
            }`}>
              {status === 'notified' ? 'À récupérer' : 'En attente'}
            </span>
          </div>
        )}

        {/* Bouton Retour (pour les emprunts) */}
        {type === 'loan' && onReturn && (
          <button
            onClick={handleReturn}
            disabled={isReturning}
            className="mt-2 self-start px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isReturning ? 'Traitement...' : 'Retourner'}
          </button>
        )}
      </div>
    </div>
  );
}