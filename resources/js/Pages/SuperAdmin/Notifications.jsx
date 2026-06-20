import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { useState, useEffect } from 'react';
import { Bell, CheckCircle, X, Loader2, Clock, AlertCircle, Building2, Eye } from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../../services/api';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await api.getSuperAdminNotifications();
            console.log('📋 Notifications reçues:', data); // 🔥 DEBUG
            setNotifications(data);
            setUnreadCount(data.filter(n => n.status === 'unread').length);
        } catch (error) {
            console.error('Erreur chargement notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const result = await api.markSuperAdminNotificationAsRead(notificationId);
            if (result.success) {
                await fetchNotifications();
                setMessage({ type: 'success', text: 'Notification marquée comme lue' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors du marquage' });
        } finally {
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const result = await api.markAllSuperAdminNotificationsAsRead();
            if (result.success) {
                await fetchNotifications();
                setMessage({ type: 'success', text: 'Toutes les notifications ont été marquées comme lues' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors du marquage' });
        } finally {
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleNotificationClick = (notification) => {
        if (notification.type === 'library_creation_request') {
            router.visit('/super-admin/library-requests');
        }
    };

    const getNotificationIcon = (notification) => {
        switch (notification.type) {
            case 'library_creation_request':
                return <Building2 className="w-5 h-5 text-orange-500" />;
            default:
                return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    const getNotificationColor = (notification) => {
        if (notification.status === 'unread') {
            return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500';
        }
        return 'bg-gray-50 dark:bg-gray-800/50';
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <SuperAdminLayout>
            {/* En-tête */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            Notifications
                        </h1>
                        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
                            Gérez vos notifications
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Tout marquer comme lu
                        </button>
                    )}
                </div>
            </div>

            {/* Message de notification */}
            {message && (
                <div className={`mb-4 p-4 rounded-xl flex items-center justify-between ${
                    message.type === 'success' 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                    <div className="flex items-center gap-3">
                        {message.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                        <span className={message.type === 'success' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}>
                            {message.text}
                        </span>
                    </div>
                    <button onClick={() => setMessage(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                        <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>
            )}

            {/* Compteur */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                <div className="flex items-center gap-3">
                    <Bell className="w-6 h-6 text-orange-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                        {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
                    </span>
                    <span className="text-sm text-gray-400 dark:text-gray-500 ml-auto">
                        {notifications.length} au total
                    </span>
                </div>
            </div>

            {/* Liste des notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Aucune notification</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                            Les notifications apparaîtront ici quand vous en recevrez.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {notifications.map((notification) => {
                            // 🔥 Récupérer le titre et le message depuis les bons champs
                            const title = notification.title || notification.data?.title || 'Notification';
                            const message = notification.message || notification.data?.message || 'Nouvelle notification';
                            const libraryName = notification.library_name || notification.data?.library_name;
                            
                            return (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer ${getNotificationColor(notification)}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            {getNotificationIcon(notification)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                                        {title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {message}
                                                    </p>
                                                    {libraryName && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                            📚 {libraryName}
                                                        </p>
                                                    )}
                                                </div>
                                                {notification.status === 'unread' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMarkAsRead(notification.id);
                                                        }}
                                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                                                    >
                                                        Marquer comme lu
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                {formatDate(notification.created_at)}
                                            </p>
                                        </div>
                                        {notification.status === 'unread' && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </SuperAdminLayout>
    );
}