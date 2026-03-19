import { X, Trophy, BookOpen, Award,ChevronLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';

export default function BadgeModal({ isOpen, onClose, user }) {
  const [userPhoto, setUserPhoto] = useState(user?.photo || null);
useEffect(() => {
    if (!user?.photo) {
      const savedPhoto = localStorage.getItem('userPhoto');
      if (savedPhoto) {
        setUserPhoto(savedPhoto);
      }
    } else {
      setUserPhoto(user.photo);
    }
  }, [user]);
  if (!isOpen) return null;

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Nouveau lecteur':
        return 'from-gray-400 to-gray-600';
      case 'Régulier':
        return 'from-blue-400 to-blue-600';
      case 'Premium':
        return 'from-yellow-400 to-orange-500';
      case 'Sous surveillance':
        return 'from-red-400 to-red-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'Premium':
        return '👑';
      case 'Sous surveillance':
        return '⚠️';
      case 'Régulier':
        return '⭐';
      default:
        return '📚';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 ">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl ">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
             <ChevronLeft className="w-8 h-8" />
          </button>
        </div>
        
        {/* Contenu */}
        <div className="p-6">
           {/* Infos utilisateur - AVEC PHOTO */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl text-white font-bold shadow-lg overflow-hidden">
              {userPhoto ? (
                <img 
                  src={userPhoto} 
                  alt={user?.nom} 
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.nom?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <h3 className="text-2xl font-bold mb-2">{user?.nom || 'Utilisateur'}</h3>
            <p className="text-gray-600">ID: {user?.id || 'N/A'}</p>
          </div>

          {/* Badge */}
          <div className={`bg-gradient-to-r ${getBadgeColor(user?.badge?.nom)} rounded-2xl p-6 mb-6 text-white shadow-xl`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6" />
                <span className="font-semibold">Badge actuel</span>
              </div>
              <span className="text-3xl">{getBadgeIcon(user?.badge?.nom)}</span>
            </div>
            <h4 className="text-2xl font-bold mb-1">{user?.badge?.nom || 'Nouveau lecteur'}</h4>
            <p className="text-white/90 text-sm">Continuez à lire pour améliorer votre badge!</p>
          </div>

          {/* Score et statistiques */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
              <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-900 mb-1">{user?.score || 0}</p>
              <p className="text-sm text-blue-700">Points</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
              <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-900 mb-1">{user?.borrowedBooks || 0}</p>
              <p className="text-sm text-green-700">Livres empruntés</p>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <h4 className="font-semibold mb-4 text-gray-900">Mon QR Code</h4>
            <div className="bg-white p-4 rounded-xl inline-block shadow-md">
              <QRCodeSVG 
                value={`DIGILIB-USER-${user?.id || '0'}`}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-xs text-gray-600 mt-4">Scannez ce code pour accéder rapidement à votre profil</p>
          </div>
        </div>
      </div>
    </div>
  );
}