import { Edit2, Award, CreditCard, Settings, HelpCircle, LogOut, ChevronRight, Trophy, BookOpen, Star, User, AlertTriangle, Mail } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react'; 
import BadgeModal from '@/Components/ProfilDetails/BadgeModal'; 
import { useAuth } from '@/contexts/AuthContext';
import api from '../services/api';
import MobileLayout from '@/Layouts/MobileLayout';

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
        
        const isComplete = profileData.user.name && profileData.user.name.trim() !== '';
        setHasCompletedProfile(isComplete);
      }

      const statusData = await api.getProfileStatus();
      if (statusData) {
        setStatus(statusData);
      }
      
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
    { id: 'edit', icon: Edit2, label: 'Éditer le profil', description: 'Modifier vos informations personnelles', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/30', route: '/profile/edit' },
    { id: 'badge', icon: Award, label: 'Badge', description: 'Voir votre progression et vos récompenses', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/30', onClick: () => setShowBadgeModal(true) },
    { id: 'cards', icon: CreditCard, label: 'Mes cartes', description: 'Gérer vos cartes de bibliothèque', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/30', route: '/profile/cards' },
    { id: 'settings', icon: Settings, label: 'Paramètres', description: 'Préférences de l\'application', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-800', route: '/profile/settings' },
    { id: 'support', icon: HelpCircle, label: 'Support', description: 'Aide et assistance', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/30', route: '/profile/support' },
    { id: 'contestations', icon: AlertTriangle, label: 'Mes contestations', description: 'Suivre vos contestations', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/30', route: '/profile/contestations' },
    { id: 'incidents', icon: Star, label: 'Mes incidents', description: 'Historique des incidents', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/30', route: '/profile/incidents' },
  ];

  const handleNavigation = (route) => {
    if (route) router.visit(route);
  };

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

  const displayName = hasCompletedProfile && profile?.name ? profile.name : 'Invité';

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!profile) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500 dark:text-gray-400">Erreur de chargement du profil</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>	
      <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-10">
        {/* En-tête avec titre - responsive */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Mon Profil</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Gérez vos informations et vos activités</p>
        </div>

        {/* Layout responsive: 1 colonne sur mobile, 3 colonnes sur desktop */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Colonne de gauche - Infos utilisateur (sur desktop: 1/3, sur mobile: pleine largeur) */}
          <div className="lg:w-1/3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden sticky lg:top-24">
              {/* Banner */}
              <div className="h-20 md:h-24 bg-gradient-to-r from-orange-500 to-orange-600"></div>
              
              {/* Avatar */}
              <div className="flex justify-center -mt-10 md:-mt-12 mb-3 md:mb-4">
                <div className="relative">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg ring-4 ring-white dark:ring-gray-800 overflow-hidden">
                    {renderAvatar()}
                  </div>
                  <button 
                    onClick={() => router.visit('/profile/edit')}
                    className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-700 rounded-full p-1.5 shadow-md hover:scale-110 transition-transform"
                  >
                    <Edit2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Infos */}
              <div className="text-center px-4 md:px-6 pb-4 md:pb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">{displayName}</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
                </div>
                
                {!hasCompletedProfile && (
                  <button
                    onClick={() => router.visit('/profile/edit')}
                    className="mt-3 md:mt-4 w-full py-2 md:py-2.5 bg-orange-500 text-white rounded-xl text-xs md:text-sm font-semibold hover:bg-orange-600 transition-colors"
                  >
                    Compléter mon profil
                  </button>
                )}

                {/* Stats rapides */}
                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-100 dark:border-gray-700">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-1 md:mb-2">
                        <Trophy className="w-4 h-4 md:w-5 md:h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Badge</p>
                      <p className="font-semibold text-xs md:text-sm text-gray-900 dark:text-white truncate">{profile.badge?.name || 'Débutant'}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-1 md:mb-2">
                        <Award className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Points</p>
                      <p className="font-semibold text-xs md:text-sm text-gray-900 dark:text-white">{profile.score || 0}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-1 md:mb-2">
                        <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Empruntés</p>
                      <p className="font-semibold text-xs md:text-sm text-gray-900 dark:text-white">{stats.total_loans || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Déconnexion */}
              <div className="px-4 md:px-6 pb-4 md:pb-6">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 md:py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-medium text-sm md:text-base hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
                <p className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 text-center mt-3 md:mt-4">
                  Déconnecté de tous les appareils
                </p>
              </div>
            </div>
          </div>

          {/* Colonne de droite - Menu des actions (sur desktop: 2/3, sur mobile: pleine largeur) */}
          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
                    className="group flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800 transition-all text-left"
                  >
                    <div className={`p-2 md:p-3 rounded-xl ${item.bgColor} group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-4 h-4 md:w-6 md:h-6 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white">{item.label}</h3>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:translate-x-1 transition-transform mt-1 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
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