import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { useAuth } from '@/contexts/AuthContext';
import api from '../../services/api';

export default function NavbarWeb() {
    const { user, isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
            
            // Écouter les événements de mise à jour (comme dans TopBar)
            const handleUpdate = () => fetchUnreadCount();
            window.addEventListener('notifications-updated', handleUpdate);
            
            // Rafraîchir toutes les 30 secondes
            const interval = setInterval(fetchUnreadCount, 30000);
            
            return () => {
                clearInterval(interval);
                window.removeEventListener('notifications-updated', handleUpdate);
            };
        }
    }, [isAuthenticated]);

    const fetchUnreadCount = async () => {
        try {
            const notifications = await api.getNotifications();
            console.log('📋 Toutes les notifications:', notifications);
            
            // 🔥 Correction : utiliser 'unread' comme dans TopBar
            const unread = notifications.filter(n => n.status === 'unread').length;
            
            console.log('🔔 Non lues (status=unread):', unread);
            setUnreadCount(unread);
        } catch (error) {
            console.error('Erreur chargement notifications:', error);
        }
    };

    const handleNotificationsClick = () => {
        router.visit('/notifications');
    };

    return (
        <header className="bg-gradient-to-b from-gray-300 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-xl">
            <div className="h-20 px-8 flex items-center justify-between">
                {/* Message de bienvenue */}
                {isAuthenticated ? (
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white leading-tight">
                            Bienvenue, {user?.name?.split(' ')[0] || 'Utilisateur'} !
                        </h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Ravi de vous revoir sur DigiLib.</p>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">DigiLib Web</h2>
                    </div>
                )}

                {/* Actions droite */}
                <div className="flex items-center">
                    {isAuthenticated ? (
                        <button 
                            onClick={handleNotificationsClick}
                            className="relative p-3 bg-white/50 dark:bg-gray-800/50 rounded-full text-gray-500 hover:bg-orange-50 hover:text-orange-600 transition-all shadow-sm"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold px-1 border-2 border-white dark:border-gray-900">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link 
                                href="/login"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 transition-colors"
                            >
                                Connexion
                            </Link>
                            <Link 
                                href="/register"
                                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                            >
                                S'inscrire
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}