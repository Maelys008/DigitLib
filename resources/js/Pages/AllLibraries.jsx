import { useState, useEffect } from 'react';
import { ArrowLeft, Building2, MapPin, BookOpen, Users, Clock, Search } from 'lucide-react';
import { router } from '@inertiajs/react';
import MobileLayout from '@/Layouts/MobileLayout';
import api from '../services/api';
import LibraryCard from '@/Components/HomeLibDetails/LibraryCard';
import { useAuth } from '../contexts/AuthContext';

export default function AllLibraries() {
  const { isAuthenticated } = useAuth();
  const [libraries, setLibraries] = useState([]);
  const [filteredLibraries, setFilteredLibraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLibraries();
  }, []);

  const fetchLibraries = async () => {
    setIsLoading(true);
    try {
      const librariesData = await api.getLibraries();
      
      const librariesWithStats = await Promise.all(librariesData.map(async (lib) => {
        try {
          const books = await api.getBooks({ library_id: lib.id });
          const members = await api.getLibraryInscriptions(lib.id);
          return {
            ...lib,
            books_count: books.data?.data?.length || 0,
            members_count: members.length || 0
          };
        } catch (error) {
          console.error(`Erreur chargement stats pour ${lib.name}:`, error);
          return {
            ...lib,
            books_count: 0,
            members_count: 0
          };
        }
      }));
      
      setLibraries(librariesWithStats);
      setFilteredLibraries(librariesWithStats);
    } catch (error) {
      console.error('Erreur chargement bibliothèques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les bibliothèques par recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLibraries(libraries);
    } else {
      const filtered = libraries.filter(lib =>
        lib.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lib.adress?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLibraries(filtered);
    }
  }, [searchTerm, libraries]);

  const handleBack = () => {
    router.visit('/');
  };

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* En-tête */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4 mb-4">
              <button 
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Toutes les bibliothèques</h1>
            </div>
            
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une bibliothèque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredLibraries.length > 0 ? (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {filteredLibraries.length} bibliothèque{filteredLibraries.length > 1 ? 's' : ''} disponible{filteredLibraries.length > 1 ? 's' : ''}
              </p>
              <div className="space-y-4">
                {filteredLibraries.map((library) => (
                  <LibraryCard 
                    key={library.id} 
                    library={library}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
              <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune bibliothèque trouvée</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {searchTerm ? 'Aucun résultat pour votre recherche' : 'Aucune bibliothèque disponible pour le moment'}
              </p>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}