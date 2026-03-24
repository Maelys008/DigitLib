import MobileLayout from '@/Layouts/MobileLayout';
import { useState } from 'react';
import { ArrowLeft, Wifi, Trash2, Eye, Moon, Globe, Bell, ChevronRight, Building, LogOut, X } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Settings() {
  const { user, logout } = useAuth();
  const [wifiOnly, setWifiOnly] = useState(true);
  const [adultContent, setAdultContent] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [interfaceLang, setInterfaceLang] = useState('Français');
  const [contentLang, setContentLang] = useState('Français');
  const [showCreateLibraryModal, setShowCreateLibraryModal] = useState(false);
  const [libraryForm, setLibraryForm] = useState({
    nom: '',
    adresse: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [libraryError, setLibraryError] = useState('');

  // Vérifier si l'utilisateur est bibliothécaire (à adapter selon ta structure)
  const isLibrarian = user?.role === 'librarian' || user?.role === 'admin';

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

  const handleLogout = async () => {
    await logout();
    router.visit('/login');
  };

  const handleCreateLibrary = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLibraryError('');

    try {
      const response = await api.createLibrary({
        nom: libraryForm.nom,
        adresse: libraryForm.adresse,
        description: libraryForm.description
      });

      if (response.success) {
        setShowCreateLibraryModal(false);
        setLibraryForm({ nom: '', adresse: '', description: '' });
        // Rediriger vers le tableau de bord bibliothèque
        router.visit('/librarian/dashboard');
      } else {
        setLibraryError(response.message);
      }
    } catch (error) {
      setLibraryError('Erreur lors de la création de la bibliothèque');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToLibrarian = () => {
    router.visit('/librarian/dashboard');
  };

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
          
          {/* Paramètres généraux */}
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

          {/* Contenu adulte */}
          <div className="pt-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Contenu adulte</h2>
            <Toggle 
              checked={adultContent}
              onChange={() => setAdultContent(!adultContent)}
              label="18+ Afficher le contenu adulte"
              icon={Eye}
            />
          </div>

          {/* Thème */}
          <div className="pt-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Thème</h2>
            <Toggle 
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              label="Mode sombre"
              icon={Moon}
            />
          </div>

          {/* Langue */}
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

          {/* Notifications */}
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

          {/* Section Bibliothèque */}
          <div className="pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Bibliothèque</h2>
            
            {!isLibrarian ? (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Building className="w-6 h-6 text-indigo-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Devenir bibliothécaire</h3>
                    <p className="text-sm text-gray-600 mb-3">
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
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <Building className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Mode bibliothécaire actif</h3>
                    <p className="text-sm text-gray-600">
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
              className="w-full flex items-center gap-3 py-4 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de création de bibliothèque */}
      {showCreateLibraryModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowCreateLibraryModal(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Créer une bibliothèque</h2>
              <button onClick={() => setShowCreateLibraryModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLibrary} className="p-6 space-y-4">
              {libraryError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {libraryError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la bibliothèque</label>
                <input
                  type="text"
                  value={libraryForm.nom}
                  onChange={(e) => setLibraryForm({ ...libraryForm, nom: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={libraryForm.adresse}
                  onChange={(e) => setLibraryForm({ ...libraryForm, adresse: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={libraryForm.description}
                  onChange={(e) => setLibraryForm({ ...libraryForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 text-white font-semibold py-4 rounded-xl hover:bg-purple-700 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? 'Création...' : 'Créer la bibliothèque'}
              </button>
            </form>
          </div>
        </>
      )}
    </MobileLayout>
  );
}