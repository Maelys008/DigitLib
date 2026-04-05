import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, BookOpen, AlertTriangle, Info, Clock, Calendar, MapPin, AlertCircle } from 'lucide-react';
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
        // Formater la notification
        const formatted = {
          ...found,
          type: getNotificationType(found.type),
          title: getNotificationTitle(found.type),
          time: formatDate(found.created_at || found.date_sent),
          read: found.status === 'lu',
          details: getNotificationDetails(found)
        };
        setNotification(formatted);
        
        // Marquer comme lue si ce n'est pas déjà fait
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
      default:
        return 'Notification';
    }
  };

  const getNotificationDetails = (notification) => {
    const details = {};
    
    // Extraire les informations du message
    if (notification.message) {
      // Ajouter des détails spécifiques selon le type
      details.additionalInfo = notification.message;
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
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-900',
          lightBg: 'bg-orange-100',
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-10 h-10" />,
          gradient: 'from-green-500 to-green-600',
          bgColor: 'bg-green-50',
          textColor: 'text-green-900',
          lightBg: 'bg-green-100',
        };
      case 'reminder':
        return {
          icon: <Clock className="w-10 h-10" />,
          gradient: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-900',
          lightBg: 'bg-blue-100',
        };
      default:
        return {
          icon: <Info className="w-10 h-10" />,
          gradient: 'from-cyan-500 to-cyan-600',
          bgColor: 'bg-cyan-50',
          textColor: 'text-cyan-900',
          lightBg: 'bg-cyan-100',
        };
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

  if (!notification) {
    return (
      <MobileLayout>
        <div className="px-6 py-4 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Notification non trouvée</p>
          <button 
            onClick={() => router.visit('/notifications')}
            className="mt-4 text-purple-600 font-medium"
          >
            Retour aux notifications
          </button>
        </div>
      </MobileLayout>
    );
  }

  const style = getIconAndColor(notification.type);

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header avec bouton retour */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <button
            onClick={() => router.visit('/notifications')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
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
            <div className={`${style.bgColor} border-l-4 border-${notification.type === 'warning' ? 'orange' : notification.type === 'success' ? 'green' : notification.type === 'reminder' ? 'blue' : 'cyan'}-500 p-5 rounded-r-xl`}>
              <p className={`${style.textColor} text-lg leading-relaxed font-medium`}>
                {notification.message}
              </p>
            </div>
          </div>

          {/* Détails */}
          {notification.details && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Détails</h2>

              {notification.details.additionalInfo && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 shadow-md">
                  <div className="flex items-start gap-3">
                    <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-bold text-blue-900 mb-2">ℹ️ Information</p>
                      <p className="text-sm text-blue-800 leading-relaxed">{notification.details.additionalInfo}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Badge "Lue" */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">Notification lue</span>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}