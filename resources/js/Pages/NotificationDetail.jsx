import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, BookOpen, AlertTriangle, Info, Clock, Calendar, MapPin, AlertCircle, Bell, MessageSquare } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import api from '../services/api';

export default function NotificationDetail() {
  const { props } = usePage();
  const { id } = props;
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotification();
  }, [id]);

  const fetchNotification = async () => {
    setIsLoading(true);
    try {
      const notifications = await api.getNotifications();
      const found = notifications.find(n => n.id === parseInt(id));
      
      if (found) {
        const formatted = {
          ...found,
          type: getNotificationType(found.type),
          title: getNotificationTitle(found.type),
          time: formatDate(found.created_at || found.date_sent),
          read: found.status === 'lu',
          details: getNotificationDetails(found)
        };
        setNotification(formatted);
        
        if (found.status === 'non lu') {
          await api.markNotificationAsRead(found.id);
        }
      }
    } catch (error) {
      console.error('Erreur chargement notification:', error);
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

  const getNotificationDetails = (notification) => {
    const details = {};
    if (notification.message) {
      details.additionalInfo = notification.message;
    }
    // 🔥 Ajouter un lien vers la contestation
    if (notification.type === 'contestation_auto' || notification.type === 'contestation_created') {
      details.contestationId = notification.object;
      details.actionLink = '/profile/contestations';
      details.actionText = 'Voir ma contestation';
    }
    return details;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIconAndColor = (type) => {
    switch (type) {
      case 'warning':
        return {
          icon: <AlertTriangle className="w-10 h-10" />,
          gradient: 'from-orange-500 to-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          textColor: 'text-orange-900 dark:text-orange-100',
          lightBg: 'bg-orange-100 dark:bg-orange-900/30',
          borderColor: 'border-orange-500'
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-10 h-10" />,
          gradient: 'from-green-500 to-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          textColor: 'text-green-900 dark:text-green-100',
          lightBg: 'bg-green-100 dark:bg-green-900/30',
          borderColor: 'border-green-500'
        };
      case 'reminder':
        return {
          icon: <Clock className="w-10 h-10" />,
          gradient: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          textColor: 'text-blue-900 dark:text-blue-100',
          lightBg: 'bg-blue-100 dark:bg-blue-900/30',
          borderColor: 'border-blue-500'
        };
      case 'contestation':
        return {
          icon: <MessageSquare className="w-10 h-10" />,
          gradient: 'from-purple-500 to-purple-600',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          textColor: 'text-purple-900 dark:text-purple-100',
          lightBg: 'bg-purple-100 dark:bg-purple-900/30',
          borderColor: 'border-purple-500'
        };
      default:
        return {
          icon: <Info className="w-10 h-10" />,
          gradient: 'from-cyan-500 to-cyan-600',
          bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
          textColor: 'text-cyan-900 dark:text-cyan-100',
          lightBg: 'bg-cyan-100 dark:bg-cyan-900/30',
          borderColor: 'border-cyan-500'
        };
    }
  };

  const handleGoToContestation = () => {
    router.visit('/profile/contestations');
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

  if (!notification) {
    return (
      <MobileLayout>
        <div className="px-6 py-4 text-center">
          <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Notification non trouvée</p>
          <button 
            onClick={() => router.visit('/notifications')}
            className="mt-4 text-purple-600 dark:text-purple-400 font-medium"
          >
            Retour aux notifications
          </button>
        </div>
      </MobileLayout>
    );
  }

  const style = getIconAndColor(notification.type);
  const isContestation = notification.type === 'contestation';

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        {/* Header avec bouton retour */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
          <button
            onClick={() => router.visit('/notifications')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour aux notifications</span>
          </button>
        </div>

        <div className="px-6 py-4">
          {/* Hero Section */}
          <div className={`bg-gradient-to-r ${style.gradient} rounded-2xl p-6 text-white mb-6 shadow-xl`}>
            <div className="flex items-start gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl flex-shrink-0">
                {style.icon}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{notification.title}</h1>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <Clock className="w-4 h-4" />
                  <span>{notification.time}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Message principal */}
          <div className="mb-6">
            <div className={`${style.bgColor} border-l-4 ${style.borderColor} p-5 rounded-r-xl`}>
              <p className={`${style.textColor} text-lg leading-relaxed font-medium`}>
                {notification.message}
              </p>
            </div>
          </div>

          {/* 🔥 Bouton d'action pour contestation */}
          {isContestation && (
            <div className="mb-6">
              <button
                onClick={handleGoToContestation}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/30"
              >
                <MessageSquare className="w-5 h-5" />
                Voir ma contestation
              </button>
            </div>
          )}

          {/* Détails */}
          {notification.details && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Détails</h2>

              {notification.details.additionalInfo && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl p-5 shadow-md">
                  <div className="flex items-start gap-3">
                    <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2">ℹ️ Information</p>
                      <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">{notification.details.additionalInfo}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Badge "Lue" */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-4 py-2 rounded-full">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">Notification lue</span>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}