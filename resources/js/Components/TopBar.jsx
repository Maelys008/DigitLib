import { useState, useEffect } from 'react';
import { Bell, LogIn, UserPlus } from 'lucide-react';
import { Link } from '@inertiajs/react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import logo from '../../../resources/images/logo .png'

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
    <div className="bg-white shadow-sm border-b border-gray-100">
      
      {/* TOP */}
      <div className="flex items-center justify-between px-6 pt-4">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <img 
           
            src={logo} 
            alt="DigiLib" 
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-lg font-bold text-gray-900">DigiLib</h1>
        </Link>

        {/* DROITE */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link 
              href="/notifications"
              className="relative p-2 hover:bg-gray-100 rounded-full transition"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          ) : (
            <>
              <Link 
                href="/login"
                className="text-sm text-gray-700 hover:text-black"
              >
                Connexion
              </Link>
              <Link 
                href="/register"
                className="px-3 py-1.5 bg-black text-white rounded-lg text-sm"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>

      {/* BAS (SALUT) */}
      {isAuthenticated && (
        <div className="px-6 pb-4 pt-2">
          <p className="text-lg font-semibold text-gray-900">
            Salut {user?.name?.split(' ')[0] || 'Utilisateur'}
          </p>
        </div>
      )}
    </div>
  );
}