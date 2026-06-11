import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, Moon, Globe, Bell, ChevronRight, LogOut, BookOpen, Users, Clock, AlertCircle, Home, Library, AlertTriangle } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';

export default function LibrarianSettings() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [interfaceLang, setInterfaceLang] = useState('Français');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoReturnReminder, setAutoReturnReminder] = useState(true);
  const [lateFeeNotification, setLateFeeNotification] = useState(true);
  const [incidentAlerts, setIncidentAlerts] = useState(true); // Nouveau toggle pour les incidents
  const [library, setLibrary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [showIncidentsPanel, setShowIncidentsPanel] = useState(false);

  useEffect(() => {
    if (user) {
      const key = `user_library_${user.id}`;
      const savedLibrary = localStorage.getItem(key);
      if (savedLibrary) {
        setLibrary(JSON.parse(savedLibrary));
      }
      fetchActiveIncidents();
    }
    setIsLoading(false);
  }, [user]);
useEffect(() => {
  if (user && incidentAlerts) {
    fetchActiveIncidents();
    const interval = setInterval(fetchActiveIncidents, 60000); // Toutes les minutes
    return () => clearInterval(interval);
  }
}, [user, incidentAlerts]);
  const fetchActiveIncidents = async () => {
    try {
      const incidents = await api.getLibraryIncidents();
      const en_attente = incidents.filter(inc => inc.status === 'en_attente' && inc.severity !== 'info');
      setActiveIncidents(en_attente);
    } catch (error) {
      console.error('Erreur chargement incidents:', error);
    }
  };

  const handleNavigateToNotifications = () => {
    router.visit('/librarian/notifications');
  };

  const handleNavigateToIncidents = () => {
    router.visit('/librarian/incidents');
  };

  const handleChangeLanguage = () => {
    console.log('Changer langue');
  };

  const handleLogout = async () => {
    await logout();
    router.visit('/login');
  };

  const handleGoHome = () => {
    router.visit('/');
  };

  const Toggle = ({ checked, onChange, label, description, icon: Icon }) => (
    <label className="flex items-center justify-between py-3 cursor-pointer w-full">
      <div className="flex items-start gap-3">
        {Icon && <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />}
        <div>
          <span className="text-gray-700 dark:text-gray-300 text-sm font-medium block">{label}</span>
          {description && <span className="text-xs text-gray-400 dark:text-gray-500">{description}</span>}
        </div>
      </div>
      <div className="inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={checked}
          onChange={onChange}
        />
        <div className={`
          relative w-9 h-5 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 
          peer-focus:ring-green-200 dark:peer-focus:ring-green-800 rounded-full peer 
          peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
          peer-checked:after:border-white after:content-[''] after:absolute 
          after:top-[2px] after:start-[2px] after:bg-white after:rounded-full 
          after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600
        `} />
      </div>
    </label>
  );

  if (isLoading) {
    return (
      <div className="px-6 py-4 dark:bg-gray-900 min-h-screen">
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => router.visit('/librarian/dashboard')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
        <button 
          onClick={handleGoHome}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors ml-auto"
          title="Aller à l'accueil"
        >
          <Home className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Informations de la bibliothèque */}
      {library && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <Library className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Votre bibliothèque</h2>
          </div>
          <p className="text-gray-900 dark:text-white font-medium">{library.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{library.adress}</p>
        </div>
      )}

      {/* Bannière d'alertes incidents */}
      {activeIncidents.length > 0 && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="font-semibold text-red-800 dark:text-red-300">Alertes incidents</span>
            </div>
            <button
              onClick={() => setShowIncidentsPanel(!showIncidentsPanel)}
              className="text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              {showIncidentsPanel ? 'Masquer' : 'Voir détails'}
            </button>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300">
            {activeIncidents.length} incident{activeIncidents.length > 1 ? 's' : ''} actif{activeIncidents.length > 1 ? 's' : ''} nécessite{activeIncidents.length > 1 ? 'nt' : ''} votre attention
          </p>
          
          {showIncidentsPanel && (
            <div className="mt-3 space-y-2">
              {activeIncidents.slice(0, 3).map((incident) => (
                <div key={incident.id} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{incident.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {incident.description?.substring(0, 60)}...
                      </p>
                    </div>
                    <button
                      onClick={() => router.visit(`/librarian/incidents/${incident.id}`)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700"
                    >
                      Voir
                    </button>
                  </div>
                </div>
              ))}
              {activeIncidents.length > 3 && (
                <button
                  onClick={handleNavigateToIncidents}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline mt-2 block text-center"
                >
                  Voir tous les incidents ({activeIncidents.length})
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="space-y-6">
        
        {/* Apparence */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Apparence</h2>
          <Toggle 
            checked={darkMode}
            onChange={toggleDarkMode}
            label="Mode sombre"
            icon={Moon}
          />
        </div>

        {/* Langue */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Langue</h2>
          <button 
            onClick={handleChangeLanguage}
            className="w-full flex items-center justify-between py-3"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">Langue de l'interface</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">{interfaceLang}</span>
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          </button>
        </div>

        {/* Notifications */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Notifications</h2>
          <Toggle 
            checked={notificationsEnabled}
            onChange={() => setNotificationsEnabled(!notificationsEnabled)}
            label="Activer les notifications"
            description="Recevoir des alertes sur l'activité de la bibliothèque"
            icon={Bell}
          />
          <Toggle 
            checked={autoReturnReminder}
            onChange={() => setAutoReturnReminder(!autoReturnReminder)}
            label="Rappels de retour"
            description="Envoyer un rappel aux membres avant la date de retour"
            icon={Clock}
          />
          <Toggle 
            checked={lateFeeNotification}
            onChange={() => setLateFeeNotification(!lateFeeNotification)}
            label="Alertes de pénalités"
            description="Être informé des retards et pénalités"
            icon={AlertCircle}
          />
          <Toggle 
            checked={incidentAlerts}
            onChange={() => setIncidentAlerts(!incidentAlerts)}
            label="Alertes incidents"
            description="Recevoir des notifications en cas d'incident signalé"
            icon={AlertTriangle}
          />
        </div>

        {/* Gestion */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Gestion</h2>
          <button
            onClick={() => router.visit('/librarian/books')}
            className="w-full flex items-center justify-between py-3"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-gray-700 dark:text-gray-300">Gestion des livres</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </button>
          <button
            onClick={() => router.visit('/librarian/internal-members')}
            className="w-full flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-gray-700 dark:text-gray-300">Équipe de la bibliothèque</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </button>
          <button
            onClick={handleNavigateToIncidents}
            className="w-full flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-gray-700 dark:text-gray-300">Gestion des incidents</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </button>
        </div>

        {/* Déconnexion */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 py-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
}