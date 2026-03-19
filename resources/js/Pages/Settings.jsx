import MobileLayout from '@/Layouts/MobileLayout';
import { useState } from 'react';
import { ArrowLeft, Wifi, Trash2, Eye, Moon, Globe, Bell, ChevronRight } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function Settings() {
  const [wifiOnly, setWifiOnly] = useState(true);
  const [adultContent, setAdultContent] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [interfaceLang, setInterfaceLang] = useState('Français');
  const [contentLang, setContentLang] = useState('Français');

  const handleDeleteFiles = () => {
    if (confirm('Voulez-vous vraiment supprimer tous les fichiers téléchargés ?')) {
      console.log('Fichiers supprimés');
    }
  };

  const handleNavigateToNotifications = () => {
    router.visit('/notifications');
  };

  const handleChangeLanguage = (type) => {
    console.log(`Changer langue ${type}`);
  };
t
const Toggle = ({ checked, onChange, label, icon: Icon }) => (
  <label className="flex items-center justify-between py-3 cursor-pointer w-full">
    <div className="flex items-center gap-3">
      {Icon && <Icon className="w-5 h-5 text-gray-600" />}
      <span className="text-gray-700 text-sm font-medium">{label}</span>
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
      <div className="px-6 py-4">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.visit('/profile')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        </div>
        <div className="space-y-6">
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Paramètres généraux</h2>
            <Toggle 
              checked={wifiOnly}
              onChange={() => setWifiOnly(!wifiOnly)}
              label="Téléchargement uniquement en Wi-Fi"
              icon={Wifi}
            />
            <button
              onClick={handleDeleteFiles}
              className="w-full flex items-center justify-between py-3 border-t border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-500" />
                <div className="text-left">
                  <span className="text-gray-700 block">Effacer les fichiers téléchargés</span>
                  <span className="text-xs text-gray-400">17,8 MB • Tous les fichiers seront supprimés</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="pt-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Contenu adulte</h2>
            <Toggle 
              checked={adultContent}
              onChange={() => setAdultContent(!adultContent)}
              label="18+ Afficher le contenu adulte"
              icon={Eye}
            />
          </div>

          <div className="pt-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Thème</h2>
            <Toggle 
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              label="Mode sombre"
              icon={Moon}
            />
          </div>

          <div className="pt-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Langue</h2>
            
            <button 
              onClick={() => handleChangeLanguage('interface')}
              className="w-full flex items-center justify-between py-3"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Langue de l'interface</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">{interfaceLang}</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>

            <button 
              onClick={() => handleChangeLanguage('content')}
              className="w-full flex items-center justify-between py-3 border-t border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Langue du contenu</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">{contentLang}</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={handleNavigateToNotifications}
              className="w-full flex items-center justify-between py-3"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}