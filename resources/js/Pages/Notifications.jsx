import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { Bell, BookOpen, Clock, AlertCircle, CheckCircle2, Mail, MailOpen, Info, AlertTriangle, MessageSquare, ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '@/contexts/AuthContext';
import api from '../services/api';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await api.getNotifications();
      const formattedNotifications = data.map(notif => ({
        ...notif,
        type: getNotificationType(notif.type),
        title: getNotificationTitle(notif.type),
        time: formatDate(notif.created_at || notif.date_sent),
        read: notif.status === 'lu'
      }));
      setNotifications(formattedNotifications);
      const unread = formattedNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationType = (type) => {
    switch (type) {
      case 'penalty':
      case 'penalty_final':
      case 'return_confirmation':
        return 'warning';
      case 'loan_success':
      case 'badge_upgrade':
        return 'success';
      case 'book_available':
        return 'reminder';
      case 'contestation_auto':
      case 'contestation_created':
        return 'contestation';
      default:
        return 'info';
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case 'loan_success':
        return 'Emprunt réussi';
      case 'book_available':
        return 'Livre disponible';
      case 'badge_upgrade':
        return 'Nouveau badge débloqué';
      case 'penalty':
      case 'penalty_final':
        return 'Pénalité';
      case 'return_confirmation':
        return 'Retour confirmé';
      case 'contestation_auto':
      case 'contestation_created':
        return 'Contestation disponible';
      default:
        return 'Notification';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />;
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />;
      case 'reminder':
        return <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
      case 'contestation':
        return <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      default:
        return <Info className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />;
    }
  };

  const getBgColor = (type, read) => {
    if (read) return 'bg-white dark:bg-gray-800';
    switch (type) {
      case 'warning':
        return 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20';
      case 'success':
        return 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20';
      case 'reminder':
        return 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20';
      case 'contestation':
        return 'bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20';
      default:
        return 'bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/20';
    }
  };

  const getBorderColor = (type, read) => {
    if (read) return 'border-gray-200 dark:border-gray-700';
    switch (type) {
      case 'warning':
        return 'border-orange-200 dark:border-orange-800';
      case 'success':
        return 'border-green-200 dark:border-green-800';
      case 'reminder':
        return 'border-blue-200 dark:border-blue-800';
      case 'contestation':
        return 'border-purple-200 dark:border-purple-800';
      default:
        return 'border-cyan-200 dark:border-cyan-800';
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
      }
      return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else if (days === 1) {
      return 'hier';
    } else if (days < 7) {
      return `il y a ${days} jours`;
    } else {
      return d.toLocaleDateString('fr-FR');
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleNotificationClick = (notification) => {
    if (notification.type === 'contestation' || notification.original_type === 'contestation_auto') {
      router.visit('/profile/contestations');
    } else {
      router.visit(`/notifications/${notification.id}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await api.markAllNotificationsAsRead();
    if (result.success) {
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    }
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-6 py-4 pb-24">
        {/* En-tête avec bouton retour */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <button 
              onClick={handleGoBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center justify-between flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
              {unreadCount > 0 && (
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg shadow-orange-500/30">
                  {unreadCount} {unreadCount === 1 ? 'nouvelle' : 'nouvelles'}
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-14">
            {unreadCount > 0
              ? `Vous avez ${unreadCount} notification(s) non lue(s)`
              : 'Toutes vos notifications ont été lues ✓'
            }
          </p>
        </div>

        {/* Liste des notifications */}
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Bell className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Aucune notification</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Vous serez notifié ici des mises à jour</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`${getBgColor(notification.type, notification.read)} rounded-2xl p-4 shadow-md border-2 ${getBorderColor(notification.type, notification.read)} transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer relative overflow-hidden`}
              >
                {/* Icône lue/non lue */}
                <div className="absolute top-3 right-3">
                  {notification.read ? (
                    <div className="relative group">
                      <MailOpen className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <div className="absolute right-0 top-7 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        Lue
                      </div>
                    </div>
                  ) : (
                    <div className="relative group">
                      <Mail className="w-5 h-5 text-orange-500 animate-pulse" />
                      <div className="absolute right-0 top-7 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        Non lue
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pr-8">
                  <div className="flex-shrink-0 pt-1">
                    <div className={`p-2 rounded-xl ${notification.read ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white/50 dark:bg-black/20 backdrop-blur-sm'}`}>
                      {getIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className={`font-bold text-lg ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {notification.title}
                      </h3>
                    </div>
                    <p className={`text-sm mb-3 leading-relaxed ${!notification.read ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${notification.read ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : 'bg-white/70 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300'}`}>
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">{notification.time}</span>
                      </div>
                      {!notification.read && (
                        <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-lg font-semibold animate-pulse">
                          NOUVEAU
                        </div>
                      )}
                      {notification.type === 'contestation' && (
                        <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-lg font-semibold">
                          À contester
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {notifications.length > 0 && unreadCount > 0 && (
          <div className="mt-6">
            <button
              onClick={handleMarkAllAsRead}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/30"
            >
              ✓ Marquer toutes comme lues
            </button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}