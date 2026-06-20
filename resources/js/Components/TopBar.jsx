import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Link } from '@inertiajs/react';
import api from '../services/api';
import { useAuth } from '@/contexts/AuthContext';
import logo from '../../images/logo .png'

export default function TopBar() {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

 useEffect(() => {
  if (isAuthenticated) {
    fetchUnreadCount();
    
    // Écouter les événements de mise à jour
    const handleUpdate = () => fetchUnreadCount();
    window.addEventListener('notifications-updated', handleUpdate);
    
    return () => window.removeEventListener('notifications-updated', handleUpdate);
  }
}, [isAuthenticated]);

const fetchUnreadCount = async () => {
  try {
    const notifications = await api.getNotifications();
    console.log('📋 Toutes les notifications:', notifications);
    
    // ✅ Correction : utiliser le champ 'status'
    const unread = notifications.filter(n => n.status === 'unread').length;
    
    console.log('🔔 Non lues (status=unread):', unread);
    setUnreadCount(unread);
  } catch (error) {
    console.error('Erreur notifications:', error);
  }
};

  return (
    <header className="bg-gradient-to-b from-gray-300 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-100 dark:border-gray-700 shadow-xl w-full">
      <div className="py-4">
        <div className="flex items-center justify-between px-6">
          {/* LOGO ET TITRE */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <img src={logo} alt="DigiLib Logo" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                  DigiLib
                </span>
              </h1>
              <p className="text-xs text-gray-800 dark:text-gray-400">Bibliothèque numérique</p>
            </div>
          </Link>

          {/* ACTIONS DROITE */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link 
                href="/notifications"
                className="relative p-2 hover:bg-gray-600/50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  href="/login"
                  className="text-sm text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors"
                >
                  Connexion
                </Link>
                <Link 
                  href="/register"
                  className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* MESSAGE DE BIENVENUE */}
        {isAuthenticated && (
          <div className="mt-4 pt-2 px-6">
            <p className="text-sm text-gray-800 dark:text-gray-300">
              Bienvenue, <span className="font-semibold text-black dark:text-white">{user?.name?.split(' ')[0] || 'Utilisateur'}</span>
            </p>
          </div>
        )}
      </div>
    </header>
  );
}