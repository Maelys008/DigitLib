import { useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle } from 'lucide-react';

export default function BorrowButton({ 
  bibliothequeNom,
  isLibraryJoined,
  onBorrow,
  onShowWarning, 
  className = '' 
}) {
  const [showWarning, setShowWarning] = useState(false);
  const [isBorrowed, setIsBorrowed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = () => {
    if (!isLibraryJoined) {
      if (onShowWarning) {
        onShowWarning(true);
      }
      
      // Scroller jusqu'au bouton rejoindre
      const joinButton = document.getElementById('join-library-button');
      if (joinButton) {
        joinButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      // Bibliothèque déjà rejointe, on peut emprunter
      setIsBorrowed(true);
      setShowSuccess(true);
      
      if (onBorrow) {
        onBorrow();
      }
      
      // Cacher le message de succès après 3 secondes
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
  };

  return (
    <div className="relative mb-6">
      {/* Message de succès d'emprunt */}
      {showSuccess && (
        <div className="mb-3 bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">
                Livre emprunté avec succès !
              </p>
            {/* <p className="text-xs text-green-600 mt-0.5">
                Date de retour : {new Date(Date.now() + 14*24*60*60*1000).toLocaleDateString('fr-FR')}
              </p> */}
            </div>
          </div>
        </div>
      )}

      {/* Bouton d'emprunt */}
      <button
        onClick={handleClick}
        disabled={isBorrowed}
        className={`
          w-full font-semibold py-4 rounded-xl transition-all shadow-md
          ${isBorrowed 
            ? 'bg-green-100 text-green-700 border border-green-200 cursor-default' 
            : isLibraryJoined
              ? 'bg-gray-900 text-white hover:bg-gray-700 active:scale-95'
              : 'bg-gray-200 text-gray-500 hover:bg-gray-300 cursor-pointer'
          }
          ${className}
        `}
      >
        {isBorrowed ? (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Livre emprunté
          </span>
        ) : (
          'Emprunter ce livre'
        )}
      </button>
    </div>
  );
}