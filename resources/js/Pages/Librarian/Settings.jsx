import MobileLayout from '@/Layouts/MobileLayout';
import { useState } from 'react';
import { ArrowLeft, Moon, Globe, Bell, ChevronRight, LogOut, BookOpen, Users, Clock, AlertCircle, Home } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext'; // ← Import du thème

export default function LibrarianSettings() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme(); // ← Utilise le thème
  const [interfaceLang, setInterfaceLang] = useState('Français');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoReturnReminder, setAutoReturnReminder] = useState(true);
  const [lateFeeNotification, setLateFeeNotification] = useState(true);

  const handleNavigateToNotifications = () => {
    router.visit('/librarian/notifications');
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

      <div className="space-y-6">
        
       
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Apparence</h2>
          <Toggle 
            checked={darkMode}
            onChange={toggleDarkMode}
            label="Mode sombre"
            icon={Moon}
          />
        </div>

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
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Gestion</h2>
          <button
            onClick={() => router.visit('/librarian/library-info')}
            className="w-full flex items-center justify-between py-3"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-gray-700 dark:text-gray-300">Informations de la bibliothèque</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </button>
          <button
            onClick={() => router.visit('/librarian/borrowing-rules')}
            className="w-full flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-gray-700 dark:text-gray-300">Règles d'emprunt</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </button>
          <button
            onClick={() => router.visit('/librarian/staff')}
            className="w-full flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-gray-700 dark:text-gray-300">Équipe de la bibliothèque</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </button>
        </div>

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