import MobileLayout from '@/Layouts/MobileLayout';
import { Edit2, Award, CreditCard, Settings, HelpCircle, LogOut, ChevronRight, Trophy, BookOpen, Star, User , AlertTriangle } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react'; 
import BadgeModal from '@/Components/ProfilDetails/BadgeModal'; 
import { useAuth } from '@/contexts/AuthContext';
import api from '../services/api';


export default function Profile() {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    total_loans: 0,
    active_loans: 0
  });
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const profileData = await api.getProfile();
      console.log('Profil data:', profileData);
      
      if (profileData) {
        setProfile(profileData.user);
        setStats(profileData.stats);
        
        // Vérifier si le profil est complété
        const isComplete = profileData.user.name && profileData.user.name.trim() !== '';
        setHasCompletedProfile(isComplete);
      }

      const statusData = await api.getProfileStatus();
      if (statusData) {
        setStatus(statusData);
      }
      
      // Récupérer la photo avec l'ID de l'utilisateur
      if (authUser?.id) {
        const savedPhoto = localStorage.getItem(`userPhoto_${authUser.id}`);
        if (savedPhoto) {
          setUserPhoto(savedPhoto);
        }
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.visit('/');
  };

  const getInitials = (name) => {
    if (!name || name.trim() === '') return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const menuItems = [
    { id: 'edit', icon: Edit2, label: 'Éditer le profil', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30', route: '/profile/edit' },
    { id: 'badge', icon: Award, label: 'Badge', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30', onClick: () => setShowBadgeModal(true) },
    { id: 'cards', icon: CreditCard, label: 'Mes cartes', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30', route: '/profile/cards' },
    { id: 'settings', icon: Settings, label: 'Paramètres', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-800', route: '/profile/settings' },
    { id: 'support', icon: HelpCircle, label: 'Support', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30', route: '/profile/support' },
    { id: 'contestations', icon: AlertTriangle, label: 'Mes contestations', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30', route: '/profile/contestations' },
{ id: 'incidents', icon:  Star, label: 'Mes incidents', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30', route: '/profile/incidents' },
  ];

  const handleNavigation = (route) => {
    if (route) router.visit(route);
  };

  // Déterminer l'affichage de l'avatar
  const renderAvatar = () => {
    if (userPhoto) {
      return (
        <img 
          src={userPhoto} 
          alt={profile?.name} 
          className="w-full h-full object-cover"
        />
      );
    }
    
    if (hasCompletedProfile && profile?.name) {
      return getInitials(profile.name);
    }
    
    return <User className="w-12 h-12 text-white" />;
  };

  // Déterminer le nom affiché
  const displayName = hasCompletedProfile && profile?.name ? profile.name : 'Invité';

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!profile) {
    return (
      <MobileLayout>
        <div className="px-6 py-4 text-center">
          <p className="text-gray-500 dark:text-gray-400">Erreur de chargement du profil</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>	
      <div className="px-6 py-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-3 overflow-hidden">
            {renderAvatar()}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">{displayName}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center">{profile.email}</p>
          
          {/* Message d'invitation à compléter le profil si ce n'est pas fait */}
          {!hasCompletedProfile && (
            <button
              onClick={() => router.visit('/profile/edit')}
              className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              Compléter mon profil
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-1">
              <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Badge</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{profile.badge?.name || 'Débutant'}</p>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-1">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Points</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{profile.score || 0}</p>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-1">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Empruntés</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{stats.total_loans || 0}</p>
          </div>
        </div>

        <div className="space-y-2 mb-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else {
                    handleNavigation(item.route);
                  }
                }}
                className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-xl transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        >
          <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="font-medium text-red-600 dark:text-red-400">Déconnexion</span>
        </button>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
          Déconnecté de tous les appareils
        </p>
      </div>

      <BadgeModal 
        isOpen={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
        user={{
          ...profile,
          badge: profile.badge,
          borrowedBooks: stats.total_loans,
          photo: userPhoto
        }}
      />
    </MobileLayout>
  );
}