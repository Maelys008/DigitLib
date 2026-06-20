import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { Search, X, ChevronLeft, BookOpen, Library, Building2, Users, MapPin } from 'lucide-react'; 
import { router } from '@inertiajs/react';
import NewBookCard from '@/Components/NewBookCard'; 
import api from '../services/api';

const normalizeBook = (book) => ({
  ...book,
  image_couverture: book.cover_url || book.cover_image,
  nb_disponibles: book.nb_available,
  note: book.note || 4.0,
  titre: book.title,
  auteur: book.author,
});

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('books');
  const [bookResults, setBookResults] = useState([]);
  const [libraryResults, setLibraryResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setHasSearched(true);
    setIsLoading(true);

    try {
      if (searchType === 'books') {
        const response = await api.getBooks({ 
          search: searchTerm.trim(),
          per_page: 50
        });
        
        let booksData = [];
        let total = 0;
        
        if (response.data?.data) {
          booksData = response.data.data;
          total = response.data.total || booksData.length;
        } else if (Array.isArray(response)) {
          booksData = response;
          total = booksData.length;
        } else if (response.data && Array.isArray(response.data)) {
          booksData = response.data;
          total = booksData.length;
        }
        
        const normalizedBooks = booksData.map(normalizeBook);
        setBookResults(normalizedBooks);
        setTotalResults(total);
        setLibraryResults([]);
        
      } else {
        const libraries = await api.getLibraries();
        const filtered = libraries.filter(lib => 
          lib.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (lib.adress && lib.adress.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setLibraryResults(filtered);
        setTotalResults(filtered.length);
        setBookResults([]);
      }
      
    } catch (error) {
      console.error('Erreur recherche:', error);
      setBookResults([]);
      setLibraryResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSearchTerm('');
    setBookResults([]);
    setLibraryResults([]);
    setHasSearched(false);
    setTotalResults(0);
  };

  const handleBack = () => {
    setHasSearched(false);
    setBookResults([]);
    setLibraryResults([]);
    setSearchTerm('');
    setTotalResults(0);
  };

  const getLibraryImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const port = window.location.port;
    const baseUrl = `${window.location.protocol}//${window.location.hostname}${port ? ':' + port : ''}`;
    return `${baseUrl}/storage/${imagePath.replace('/storage/', '')}`;
  };

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Barre de recherche - Version Web responsif */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-6">
            <div className="flex items-center gap-3 md:gap-4">
              {hasSearched && (
                <button 
                  onClick={handleBack} 
                  className="p-1.5 md:p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 md:w-5 md:h-5" />
                </button>
              )}

              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2">
                    <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchType === 'books' 
                      ? "Rechercher un livre, un auteur ou un genre..." 
                      : "Rechercher une bibliothèque par nom ou adresse..."
                    }
                    className="w-full pl-9 md:pl-12 pr-9 md:pr-12 py-2.5 md:py-3.5 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl md:rounded-2xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white transition-all"
                    autoFocus
                  />
                  
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 bg-gray-300 dark:bg-gray-600 rounded-full p-0.5 md:p-1 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                    >
                      <X className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </button>
                  )}
                </div>
              </form>
              
              {!hasSearched && (
                <button 
                  onClick={handleCancel}
                  className="px-3 py-1.5 md:px-4 text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Annuler
                </button>
              )}
            </div>

            {/* Type de recherche - Toggle */}
            <div className="flex gap-2 md:gap-3 mt-4 md:mt-6">
              <button
                onClick={() => setSearchType('books')}
                className={`flex items-center justify-center gap-1.5 md:gap-2 flex-1 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all ${
                  searchType === 'books'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/25'
                    : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Livres
              </button>
              <button
                onClick={() => setSearchType('libraries')}
                className={`flex items-center justify-center gap-1.5 md:gap-2 flex-1 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all ${
                  searchType === 'libraries'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/25'
                    : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <Library className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Bibliothèques
              </button>
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 md:py-20">
              <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-gray-200 dark:border-gray-700 border-t-orange-500 rounded-full animate-spin"></div>
              <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-500 dark:text-gray-400">
                {searchType === 'books' ? 'Recherche de livres...' : 'Recherche de bibliothèques...'}
              </p>
            </div>
          )}

          {!isLoading && hasSearched && (
            <>
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-2">
                  {searchType === 'books' ? (
                    <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                  ) : (
                    <Library className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                  )}
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">{totalResults}</span> résultat{totalResults > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {totalResults === 0 ? (
                <div className="text-center py-12 md:py-20 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-700">
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Search className="w-8 h-8 md:w-12 md:h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium">Aucun résultat trouvé</p>
                  <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500 mt-1 md:mt-2">
                    Essayez avec d'autres mots-clés ou vérifiez l'orthographe
                  </p>
                </div>
              ) : searchType === 'books' ? (
                // Affichage des livres en grille responsive
                <div className="space-y-3">
                  {bookResults.map((livre) => (
                    <div key={livre.id} className="transform transition-all duration-300 hover:-translate-y-1">
                      <NewBookCard livre={livre} />
                    </div>
                  ))}
                </div>
              ) : (
                // Affichage des bibliothèques en grille responsive
                <div className="space-y-3">
                  {libraryResults.map((library) => {
                    const imageUrl = getLibraryImageUrl(library.library_image);
                    return (
                      <div
                        key={library.id}
                        onClick={() => router.visit(`/libraries/${library.id}`)}
                        className="group bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="h-32 md:h-36 relative overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={library.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                              <Building2 className="w-10 h-10 md:w-12 md:h-12 text-white opacity-80" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-2 md:bottom-3 left-3 md:left-4">
                            <h3 className="font-bold text-white text-sm md:text-lg line-clamp-1">{library.name}</h3>
                          </div>
                        </div>
                        
                        <div className="p-3 md:p-4">
                          <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2 md:mb-3">
                            <MapPin className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                            <span className="line-clamp-1">{library.adress || 'Adresse non renseignée'}</span>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <Users className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                {library.members_count || 0} membres
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <BookOpen className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                {library.books_count || 0} livres
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {!hasSearched && !isLoading && (
            <div className="text-center py-16 md:py-32">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Search className="w-12 h-12 md:w-16 md:h-16 text-orange-500 dark:text-orange-400 opacity-60" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {searchType === 'books' ? 'Que voulez-vous lire ?' : 'Quelle bibliothèque cherchez-vous ?'}
              </h2>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                {searchType === 'books' 
                  ? 'Recherchez un livre, un auteur ou un genre pour commencer'
                  : 'Recherchez une bibliothèque par nom ou par adresse'
                }
              </p>
              {searchType === 'books' && (
                <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-6 md:mt-8">
                  <span className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-xs md:text-sm text-gray-600 dark:text-gray-400">Roman</span>
                  <span className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-xs md:text-sm text-gray-600 dark:text-gray-400">Science-fiction</span>
                  <span className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-xs md:text-sm text-gray-600 dark:text-gray-400">Thriller</span>
                  <span className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-xs md:text-sm text-gray-600 dark:text-gray-400">Fantasy</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}