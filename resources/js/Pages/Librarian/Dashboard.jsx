// resources/js/Pages/Librarian/Dashboard.jsx

import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Users, TrendingUp, Settings, Building, Library as LibraryIcon } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [library, setLibrary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const response = await api.getUserLibraries();
        if (response && response.length > 0) {
          setLibrary(response[0]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la bibliothèque:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibrary();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.visit('/')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          </div>
          <button 
            onClick={() => router.visit('/settings')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Settings className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Informations de la bibliothèque */}
        {library && (
          <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
            <div className="flex items-center gap-4 p-5 border-b border-gray-100">
              {/* Image de la bibliothèque - utilise library_url */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                {library.library_url ? (
                  <img 
                    src={library.library_url} 
                    alt={library.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <LibraryIcon className="w-8 h-8 text-purple-500" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{library.name}</h2>
                <p className="text-sm text-gray-500">{library.adress}</p>
                {library.description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{library.description}</p>
                )}
              </div>
            </div>
            
            {/* Stats de la bibliothèque */}
            <div className="grid grid-cols-3 gap-4 p-5 bg-gray-50">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{library.books?.length || 0}</p>
                <p className="text-xs text-gray-500">Livres</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{library.members_count || 0}</p>
                <p className="text-xs text-gray-500">Membres</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500">Emprunts</p>
              </div>
            </div>
          </div>
        )}

        {/* Bienvenue */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
          <h2 className="text-2xl font-bold mb-2">Bienvenue, {user?.name} !</h2>
          <p className="text-purple-100">Vous êtes connecté en tant que bibliothécaire.</p>
        </div>

        {/* Actions rapides */}
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Actions rapides</h3>
        <div className="space-y-3">
          <button className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">Ajouter un livre</span>
            </div>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Gérer les membres</span>
            </div>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">Voir les statistiques</span>
            </div>
            <span className="text-gray-400">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}