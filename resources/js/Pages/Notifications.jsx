import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, CheckCircle, AlertCircle, BookOpen, Award, Clock, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../contexts/AuthContext';
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
      setNotifications(data);
      const unread = data.filter(n => n.status === 'non lu').length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    const result = await api.markNotificationAsRead(notificationId);
    if (result.success) {
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, status: 'lu' } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await api.markAllNotificationsAsRead();
    if (result.success) {
      setNotifications(prev => prev.map(notif => ({ ...notif, status: 'lu' })));
      setUnreadCount(0);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'loan_success':
        return <BookOpen className="w-5 h-5 text-green-600" />;
      case 'book_available':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'badge_upgrade':
        return <Award className="w-5 h-5 text-purple-600" />;
      case 'penalty':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBg = (type) => {
    switch (type) {
      case 'loan_success':
        return 'bg-green-50';
      case 'book_available':
        return 'bg-blue-50';
      case 'badge_upgrade':
        return 'bg-purple-50';
      case 'penalty':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
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

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-6 py-4">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.visit('/profile')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-purple-600 font-medium hover:text-purple-700"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Liste des notifications */}
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Aucune notification</p>
            <p className="text-xs text-gray-400 mt-2">
              Les notifications apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl p-4 transition-all ${getNotificationBg(notification.type)} ${
                  notification.status === 'non lu' ? 'border-l-4 border-l-purple-600' : 'opacity-70'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icône */}
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* Contenu */}
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(notification.created_at || notification.date_sent)}
                    </p>
                  </div>
                  
                  {/* Bouton marquer comme lu */}
                  {notification.status === 'non lu' && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                      title="Marquer comme lu"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}