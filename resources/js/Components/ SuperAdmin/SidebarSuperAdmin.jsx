import { Link, usePage, router } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Users, 
    Library, 
    ClipboardList, 
    Bell, 
    Settings, 
    LogOut,
    ShieldCheck,
    Home,
    Building2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import api from '@/services/api';

export default function SidebarSuperAdmin({ onItemClick }) {
    const { url } = usePage();
    const { logout } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    // 🔥 Récupérer le nombre de notifications non lues
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const notifications = await api.getSuperAdminNotifications();
                const unread = notifications.filter(n => n.status === 'unread').length;
                setUnreadCount(unread);
            } catch (error) {
                console.error('Erreur chargement notifications:', error);
            }
        };

        fetchUnreadCount();

        // Rafraîchir toutes les 30 secondes
        const interval = setInterval(fetchUnreadCount, 30000);
        
        // Écouter les événements de mise à jour
        const handleUpdate = () => fetchUnreadCount();
        window.addEventListener('notifications-updated', handleUpdate);

        return () => {
            clearInterval(interval);
            window.removeEventListener('notifications-updated', handleUpdate);
        };
    }, []);

    // 🔥 Routes existantes pour le Super Admin
    const navItems = [
        { path: '/super-admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
        { path: '/super-admin/users', icon: Users, label: 'Utilisateurs' },
        { path: '/super-admin/library-requests', icon: ClipboardList, label: 'Demandes' },
        { path: '/super-admin/notifications', icon: Bell, label: 'Notifications' },
    ];

    const isActive = (path) => {
        if (path === '/super-admin/dashboard' && url === '/super-admin/dashboard') return true;
        if (path !== '/super-admin/dashboard' && url.startsWith(path)) return true;
        return false;
    };

    const handleLogout = async () => {
        await logout();
        router.visit('/login');
    };

    return (
        <aside className="h-full w-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold">
                        <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                            DigiLib
                        </span>
                    </h1>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Super Admin</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {/* Lien vers l'accueil public */}
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all"
                >
                    <Home className="w-4 h-4" />
                    <span>Aller sur le site</span>
                </Link>

                <div className="h-px bg-gray-200 dark:bg-gray-700 my-3"></div>

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    const isNotifications = item.path === '/super-admin/notifications';
                    
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            onClick={onItemClick}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                active
                                    ? 'bg-orange-100/80 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${active ? 'text-orange-600 dark:text-orange-400' : ''}`} />
                            <span>{item.label}</span>
                            {isNotifications && unreadCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Déconnexion</span>
                </button>
                <p className="text-center text-[10px] text-gray-400 dark:text-gray-500">
                    © 2026 DigiLib - Super Admin
                </p>
            </div>
        </aside>
    );
}