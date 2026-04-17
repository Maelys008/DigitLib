import { X, Trophy, BookOpen, Award, ChevronLeft, User, Mail, Calendar, Star } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

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

  // Configuration des badges selon les niveaux réels
  const getBadgeColor = (badgeName) => {
    switch (badgeName) {
      case 'Bronze':
        return 'from-amber-500 to-amber-700';
      case 'Argent':
        return 'from-gray-400 to-gray-600';
      case 'Or':
        return 'from-yellow-400 to-yellow-600';
      case 'Platine':
        return 'from-cyan-400 to-cyan-600';
      case 'Diamant':
        return 'from-blue-400 to-blue-600';
      case 'Légendaire':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getBadgeIcon = (badgeName) => {
    switch (badgeName) {
      case 'Bronze':
        return '🥉';
      case 'Argent':
        return '🥈';
      case 'Or':
        return '🥇';
      case 'Platine':
        return '💎';
      case 'Diamant':
        return '✨';
      case 'Légendaire':
        return '🌟';
      default:
        return '📚';
    }
  };

  const getNextBadge = (currentBadge, currentScore) => {
    const badges = [
      { name: 'Bronze', pointsNeeded: 0, maxBooks: 2 },
      { name: 'Argent', pointsNeeded: 50, maxBooks: 4 },
      { name: 'Or', pointsNeeded: 150, maxBooks: 6 },
      { name: 'Platine', pointsNeeded: 350, maxBooks: 10 },
      { name: 'Diamant', pointsNeeded: 700, maxBooks: 15 },
      { name: 'Légendaire', pointsNeeded: 1200, maxBooks: 25 }
    ];
    
    for (let i = 0; i < badges.length; i++) {
      if (currentScore < badges[i].pointsNeeded) {
        return badges[i];
      }
    }
    return null;
  };

  const currentBadgeName = user?.badge?.name || 'Bronze';
  const currentScore = user?.score || 0;
  const nextBadge = getNextBadge(currentBadgeName, currentScore);
  const pointsToNext = nextBadge ? nextBadge.pointsNeeded - currentScore : 0;
  const progressPercentage = nextBadge 
    ? ((currentScore - (currentScore - pointsToNext)) / (nextBadge.pointsNeeded - (currentScore - pointsToNext))) * 100
    : 100;

  // Données pour le QR code (encodées en JSON)
  const qrData = JSON.stringify({
    type: 'user_profile',
    id: user?.id,
    name: user?.nom || user?.name,
    email: user?.email,
    badge: currentBadgeName,
    score: currentScore
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
        
        {/* En-tête avec bouton retour */}
        <div className="sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center rounded-t-3xl">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 dark:text-gray-300" />
          </button>
          <h2 className="text-xl font-bold ml-2 text-gray-900 dark:text-white">Mon Badge</h2>
        </div>
        
        {/* Contenu */}
        <div className="p-6">
          
          {/* Infos utilisateur avec photo */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl text-white font-bold shadow-lg overflow-hidden">
              {userPhoto ? (
                <img 
                  src={userPhoto} 
                  alt={user?.nom || user?.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <h3 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">{user?.nom || user?.name || 'Utilisateur'}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email || 'Email non renseigné'}</p>
          </div>

          {/* Badge actuel */}
          <div className={`bg-gradient-to-r ${getBadgeColor(currentBadgeName)} rounded-2xl p-6 mb-6 text-white shadow-xl transform transition-all hover:scale-[1.02]`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6" />
                <span className="font-semibold">Badge actuel</span>
              </div>
              <span className="text-4xl">{getBadgeIcon(currentBadgeName)}</span>
            </div>
            <h4 className="text-2xl font-bold mb-1">{currentBadgeName}</h4>
            <p className="text-white/90 text-sm">
              {currentBadgeName === 'Bronze' && 'Votre premier pas dans l\'aventure DigiLib'}
              {currentBadgeName === 'Argent' && 'Vous commencez à devenir un lecteur assidu'}
              {currentBadgeName === 'Or' && 'Lecteur confirmé, vous êtes un pilier de la communauté'}
              {currentBadgeName === 'Platine' && 'Expert en lecture, vous inspirez les autres'}
              {currentBadgeName === 'Diamant' && 'Maître des livres, vous êtes une légende'}
              {currentBadgeName === 'Légendaire' && 'Légende vivante de DigiLib'}
            </p>
          </div>

          {/* Barre de progression vers le prochain badge */}
          {nextBadge && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Progression vers {nextBadge.name}</span>
                <span className="text-gray-600 dark:text-gray-400 font-semibold">{pointsToNext} points restants</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-full h-2 transition-all duration-500" 
                  style={{ width: `${Math.min(100, progressPercentage)}%` }}
                />
              </div>
            </div>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 rounded-xl p-4 text-center">
              <Trophy className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-1">{currentScore}</p>
              <p className="text-sm text-orange-700 dark:text-orange-300">Points</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 rounded-xl p-4 text-center">
              <BookOpen className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">{user?.borrowedBooks || 0}</p>
              <p className="text-sm text-green-700 dark:text-green-300">Livres empruntés</p>
            </div>
          </div>

          {/* QR Code avec infos utilisateur */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 text-center">
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center justify-center gap-2">
              <Star className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              Mon QR Code
              <Star className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            </h4>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl inline-block shadow-md">
              <QRCodeSVG 
                value={qrData}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
              Scannez ce code pour accéder rapidement à votre profil ou pour être identifié en bibliothèque
            </p>
          </div>
          
          {/* Message de fin */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
            Continuez à lire et à participer pour débloquer de nouveaux badges !
          </p>
        </div>
      </div>
    </div>
  );
}