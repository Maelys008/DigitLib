import MobileLayout from '@/Layouts/MobileLayout';
import { currentUser, badges, historiqueEmprunts } from '../data/mockData';
import { Edit2, Award, CreditCard, Settings, HelpCircle, LogOut, ChevronRight, Trophy, BookOpen, Star } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useState, useEffect} from 'react'; 
import BadgeModal from '@/Components/ProfilDetails/BadgeModal'; 

export default function Profile(){
const [showBadgeModal, setShowBadgeModal] = useState(false);
const [userPhoto, setUserPhoto] = useState(currentUser.photo || null);
useEffect(() => {
  const savedPhoto = localStorage.getItem('userPhoto');
  if (savedPhoto) {
    setUserPhoto(savedPhoto);
    currentUser.photo = savedPhoto; 
  }
}, []);
  const userBadge = badges.find(b => b.id === currentUser.badge_id) || badges[0];
  const totalLivresEmpruntes = historiqueEmprunts.length + 2;
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  const menuItems = [
   { id: 'edit', icon: Edit2, label: 'Éditer le profil', color: 'text-blue-600', bgColor: 'bg-blue-100', route: '/profile/edit' },
    { id: 'badge', icon: Award, label: 'Badge', color: 'text-purple-600', bgColor: 'bg-purple-100', onClick: () => setShowBadgeModal(true) }, // ← Modifié
    { id: 'cards', icon: CreditCard, label: 'Mes cartes', color: 'text-green-600', bgColor: 'bg-green-100', route: '/profile/cards' },
    { id: 'settings', icon: Settings, label: 'Paramètres', color: 'text-gray-600', bgColor: 'bg-gray-100', route: '/profile/settings' },
    { id: 'support', icon: HelpCircle, label: 'Support', color: 'text-orange-600', bgColor: 'bg-orange-100', route: '/profile/support' },
  ];

  const handleLogout = () => {
    router.visit('/');
  };

  const handleNavigation = (route) => {
    if (route) router.visit(route);
  };

  return (
    <MobileLayout>	
      <div className="px-6 py-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-3 overflow-hidden">
            {userPhoto ? (
              <img 
                src={userPhoto} 
                alt={currentUser.nom} 
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(currentUser.nom)
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center">{currentUser.nom}</h1>
          <p className="text-gray-500 text-sm text-center">{currentUser.email}</p>
        </div>
        

      
        <div className="grid grid-cols-3 gap-3 mb-8">
       
          <div className="bg-gray-100 rounded-xl p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-1">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-xs text-gray-500">Badge</p>
            <p className="font-semibold text-gray-900 text-sm">{userBadge.nom}</p>
          </div>

          <div className="bg-gray-100 rounded-xl p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-1">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500">Points</p>
            <p className="font-semibold text-gray-900 text-sm">{currentUser.score}</p>
          </div>

          <div className="bg-gray-100 rounded-xl p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-1">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500">Empruntés</p>
            <p className="font-semibold text-gray-900 text-sm">{totalLivresEmpruntes}</p>
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
                className="w-full flex items-center justify-between p-4 bg-gray-100 rounded-xl transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="font-medium text-gray-900">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 rounded-xl border border-red-100 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5 text-red-600" />
          <span className="font-medium text-red-600">Déconnexion</span>
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          Déconnecté de tous les appareils
        </p>
      </div>

      {/* Modal du badge */}
      <BadgeModal 
        isOpen={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
        user={{
          ...currentUser,
          badge: userBadge,
          borrowedBooks: totalLivresEmpruntes,
          photo: userPhoto
        }}
      />
    </MobileLayout>
  );
}