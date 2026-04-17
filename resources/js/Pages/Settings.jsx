import MobileLayout from '@/Layouts/MobileLayout';
import { useState } from 'react';
import { ArrowLeft, Moon, Globe, Bell, ChevronRight, Building, LogOut } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme(); 
  const [interfaceLang, setInterfaceLang] = useState('Français');
  const isLibrarian = user?.role === 'admin';

  const handleNavigateToNotifications = () => {
    router.visit('/notifications');
  };

  const handleChangeLanguage = () => {
    console.log('Changer langue');
  };

  const handleLogout = async () => {
    await logout();
    router.visit('/login');
  };

  const handleSwitchToLibrarian = () => {
    router.visit('/librarian/dashboard');
  };

  const Toggle = ({ checked, onChange, label, icon: Icon }) => (
    <label className="flex items-center justify-between py-3 cursor-pointer w-full">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{label}</span>
      </div>
      <div className="inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={checked}
          onChange={onChange}
        />
        <div className={`
          relative w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 
          peer-focus:ring-green-200 rounded-full peer 
          peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
          peer-checked:after:border-white after:content-[''] after:absolute 
          after:top-[2px] after:start-[2px] after:bg-white after:rounded-full 
          after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600
        `} />
      </div>
    </label>
  );

  return (
    <MobileLayout>
      <div className="px-6 py-4 dark:bg-gray-900 min-h-screen">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.visit('/profile')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Thème</h2>
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
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Notifications</h2>
            <button
              onClick={handleNavigateToNotifications}
              className="w-full flex items-center justify-between py-3"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Section Bibliothèque */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Bibliothèque</h2>
            
            {!isLibrarian ? (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Building className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Devenir bibliothécaire</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Créez un compte bibliothèque pour gérer les livres, les emprunts et les membres.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.visit('/librarian/create')}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/30"
                >
                  Créer un compte bibliothèque
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <Building className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Mode bibliothécaire actif</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Vous avez accès aux fonctionnalités de gestion.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSwitchToLibrarian}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-lg shadow-cyan-500/30"
                >
                  Accéder au tableau de bord
                </button>
              </div>
            )}
          </div>

          {/* Déconnexion */}
          <div className="pt-2">
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
    </MobileLayout>
  );
}