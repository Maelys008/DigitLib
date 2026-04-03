import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Link } from '@inertiajs/react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import logo from '../../images/logo .png'

export default function TopBar() {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const notifications = await api.getNotifications();
      const unread = notifications.filter(n => n.status === 'non lu').length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erreur notifications:', error);
    }
  };

  return (
    <header className="bg-gradient-to-b from-gray-300 to-gray-100 border-b border-gray-100 shadow-xl w-full">
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
              <p className="text-xs text-gray-800">Bibliothèque numérique</p>
            </div>
          </Link>

          {/* ACTIONS DROITE */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link 
                href="/notifications"
                className="relative p-2 hover:bg-gray-600/50 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-800" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  href="/login"
                  className="text-sm text-gray-800 hover:text-black transition-colors"
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
            <p className="text-sm text-gray-800">
              Bienvenue, <span className="font-semibold text-black">{user?.name?.split(' ')[0] || 'Utilisateur'}</span>
            </p>
          </div>
        )}
      </div>
    </header>
  );
}