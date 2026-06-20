import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, Moon, Globe, Bell, ChevronRight, Building, LogOut, Users, CheckCircle, Clock } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useActiveLibrary } from '@/contexts/ActiveLibraryContext';
import api from '@/services/api';

export default function Settings() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme(); 
  const { switchLibrary } = useActiveLibrary();
  const [interfaceLang, setInterfaceLang] = useState('Français');
  const [internalMemberships, setInternalMemberships] = useState([]);
  const [ownedLibrary, setOwnedLibrary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPendingLibrary, setHasPendingLibrary] = useState(false);
  const [hasApprovedLibrary, setHasApprovedLibrary] = useState(false);
  const [accessLoading, setAccessLoading] = useState(false);

  useEffect(() => {
    const fetchUserLibraries = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const allLibraries = await api.getUserLibraries();
        
        console.log('🔍 Toutes les bibliothèques:', allLibraries);
        
        // 1. Bibliothèque dont il est propriétaire (admin)
        const owned = allLibraries.find(lib => lib.administrator_id === user?.id);
        setOwnedLibrary(owned || null);
        
        // 2. Vérifier le statut des bibliothèques
        const hasPending = allLibraries.some(lib => lib.status === 'pending');
        const hasApproved = allLibraries.some(lib => lib.status === 'approved' || lib.status === 'active');
        setHasPendingLibrary(hasPending);
        setHasApprovedLibrary(hasApproved);
        
        // 3. Bibliothèques où il est membre interne (staff)
        const internal = allLibraries.filter(lib => {
          if (lib.administrator_id === user?.id) return false;
          return lib.is_member_internal === true;
        });
        setInternalMemberships(internal);
        
        console.log('🏠 Bibliothèque possédée:', owned);
        console.log('👥 Bibliothèques comme membre interne:', internal);
        console.log('⏳ Demande en attente:', hasPending);
        console.log('✅ Bibliothèque approuvée:', hasApproved);
      } catch (error) {
        console.error('Erreur chargement bibliothèques:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserLibraries();
  }, [user]);

  const handleGoBack = () => {
    window.history.back();
  };

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
    if (ownedLibrary) {
      switchLibrary(ownedLibrary);
      console.log('📚 Changement vers bibliothèque possédée:', ownedLibrary.name);
      router.visit('/librarian/dashboard');
    }
  };

  const handleAccessApprovedLibrary = async () => {
    setAccessLoading(true);
    try {
      const allLibraries = await api.getUserLibraries();
      const approvedLib = allLibraries.find(lib => 
        lib.status === 'approved' || lib.status === 'active'
      );
      if (approvedLib) {
        setOwnedLibrary(approvedLib);
        switchLibrary(approvedLib);
        router.visit('/librarian/dashboard');
      } else {
        console.log('Aucune bibliothèque approuvée trouvée');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la bibliothèque:', error);
    } finally {
      setAccessLoading(false);
    }
  };

  const handleAccessLibrary = (libraryId, libraryName) => {
    switchLibrary({ id: libraryId, name: libraryName });
    console.log('📚 Changement vers bibliothèque membre interne:', libraryName);
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
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
        </div>

        <div className="space-y-6">
          {/* Thème */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Thème</h2>
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
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          </div>

          {/* Notifications */}
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
            
            {isLoading ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <>
                {/* 1. BOUTON POUR LE PROPRIÉTAIRE (ADMIN) - UNIQUEMENT SI APPROUVÉ */}
                {ownedLibrary && (ownedLibrary.status === 'approved' || ownedLibrary.status === 'active') && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Building className="w-6 h-6 text-green-600 dark:text-green-400" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Votre bibliothèque : {ownedLibrary.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Vous êtes administrateur - Accès complet
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSwitchToLibrarian}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-lg shadow-cyan-500/30"
                    >
                      Accéder à votre bibliothèque
                    </button>
                  </div>
                )}

                {/* 2. BOUTONS POUR LES MEMBRES INTERNES (STAFF) */}
                {internalMemberships.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Bibliothèques où vous êtes membre</h3>
                    {internalMemberships.map((library) => (
                      <div
                        key={library.id}
                        className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{library.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Membre interne - Accès limité (staff)
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAccessLibrary(library.id, library.name)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                          Accéder à cette bibliothèque
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. MESSAGE SI DEMANDE EN ATTENTE */}
                {hasPendingLibrary && !hasApprovedLibrary && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800 mb-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">Demande en attente</h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Votre demande de création de bibliothèque est en attente de validation par un Super Administrateur.
                          Vous serez notifié dès qu'une décision sera prise.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. MESSAGE SI BIBLIOTHÈQUE APPROUVÉE (affiché si approuvée mais ownedLibrary pas encore mis à jour) */}
                {hasApprovedLibrary && !ownedLibrary && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800 mb-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-green-800 dark:text-green-400">Bibliothèque approuvée !</h3>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Votre bibliothèque a été approuvée. Vous pouvez maintenant y accéder.
                        </p>
                        <button
                          onClick={handleAccessApprovedLibrary}
                          disabled={accessLoading}
                          className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {accessLoading ? 'Chargement...' : 'Accéder à ma bibliothèque'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. BOUTON POUR CRÉER UNE BIBLIOTHÈQUE (UNIQUEMENT si pas de bibliothèque) */}
                {!hasPendingLibrary && !hasApprovedLibrary && !ownedLibrary && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Building className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Créer votre bibliothèque</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Vous n'avez pas encore de bibliothèque. Créez-en une pour commencer à gérer des livres.
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
                )}
              </>
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