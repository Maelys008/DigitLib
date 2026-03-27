import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function LibraryJoinButton({ 
  bibliothequeNom, 
  onJoin,
  showWarning = false, 
  onWarningClose,
  className = '' 
}) {
  const [isJoined, setIsJoined] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLocalWarning, setShowLocalWarning] = useState(false);
  useEffect(() => {
    if (showWarning) {
      setShowLocalWarning(true);
      
      const timer = setTimeout(() => {
        setShowLocalWarning(false);
        if (onWarningClose) onWarningClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setShowLocalWarning(false);
    }
  }, [showWarning, onWarningClose]);

  const handleJoin = () => {
    setIsJoined(true);
    setShowSuccess(true);
    setShowLocalWarning(false); 
    
    if (onJoin) {
      onJoin();
    }
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <div className="relative" id="join-library-button">
      {showLocalWarning && (
        <div className="mb-3 bg-orange-50 border border-orange-200 rounded-xl p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">
                Vous devez rejoindre la bibliothèque
              </p>
              <p className="text-xs text-orange-600 mt-0.5">
                "{bibliothequeNom}" avant d'emprunter un livre
              </p>
            </div>
            <button 
              onClick={() => setShowLocalWarning(false)}
              className="text-orange-400 hover:text-orange-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleJoin}
        disabled={isJoined}
        className={`
          w-full font-medium py-3 rounded-xl transition-all
          ${isJoined 
            ? 'bg-green-100 text-green-700 border border-green-200 cursor-default' 
            : 'bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-md'
          }
          ${className}
        `}
      >
        {isJoined ? (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Bibliothèque rejointe
          </span>
        ) : (
          `Rejoindre la bibliothèque "${bibliothequeNom}"`
        )}
      </button>

  
      {showSuccess && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-green-50 border border-green-200 rounded-xl p-4 shadow-lg animate-fade-in z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
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