import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { Search, X, ChevronLeft, BookOpen, Library, Building2, MapPin } from 'lucide-react'; 
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
  const [activeFilter, setActiveFilter] = useState('all');
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
        
        let filteredResults = normalizedBooks;
        
        if (activeFilter === 'authors') {
          const uniqueAuthors = [...new Set(normalizedBooks.map(b => b.auteur))];
          filteredResults = normalizedBooks.filter(book => 
            uniqueAuthors.includes(book.auteur)
          );
        }
        
        setBookResults(filteredResults);
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

  const handleFilterChange = async (filter) => {
    setActiveFilter(filter);
    if (hasSearched && searchTerm.trim() && searchType === 'books') {
      setIsLoading(true);
      
      try {
        const response = await api.getBooks({ 
          search: searchTerm.trim(),
          per_page: 50
        });
        
        let booksData = [];
        if (response.data?.data) {
          booksData = response.data.data;
        } else if (Array.isArray(response)) {
          booksData = response;
        } else if (response.data && Array.isArray(response.data)) {
          booksData = response.data;
        }
        
        const normalizedBooks = booksData.map(normalizeBook);
        
        let filteredResults = normalizedBooks;
        
        if (filter === 'authors') {
          const uniqueAuthors = [...new Set(normalizedBooks.map(b => b.auteur))];
          filteredResults = normalizedBooks.filter(book => 
            uniqueAuthors.includes(book.auteur)
          );
        }
        
        setBookResults(filteredResults);
      } catch (error) {
        console.error('Erreur filtre:', error);
      } finally {
        setIsLoading(false);
      }
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
      <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {hasSearched && (
            <button 
              onClick={handleBack} 
              className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <form onSubmit={handleSearch} className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchType === 'books' 
                ? "Rechercher un livre, un auteur ou un genre"
                : "Rechercher une bibliothèque"
              }
              className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-[17px] focus:ring-0 focus:bg-gray-50 dark:focus:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
              autoFocus
            />
            
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-400 dark:bg-gray-600 rounded-full p-0.5 hover:bg-gray-500 dark:hover:bg-gray-500 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </button>
            )}
          </form>
          
          {!hasSearched && (
            <button 
              onClick={handleCancel}
              className="text-gray-600 dark:text-gray-400 text-[17px] font-normal whitespace-nowrap hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Annuler
            </button>
          )}
        </div>

        {/* Type de recherche - Toggle */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setSearchType('books')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
              searchType === 'books'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Livres
          </button>
          <button
            onClick={() => setSearchType('libraries')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
              searchType === 'libraries'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Library className="w-4 h-4" />
            Bibliothèques
          </button>
        </div>

        {/* Filtres - seulement après recherche de livres */}
        {hasSearched && searchType === 'books' && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'all' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => handleFilterChange('books')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'books' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Livres
            </button>
            <button
              onClick={() => handleFilterChange('authors')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'authors' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Auteurs
            </button>
            <button
              onClick={() => handleFilterChange('genres')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'genres' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Genres
            </button>
          </div>
        )}
      </div>

      {/* Résultats */}
      <div className="px-4 py-4">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        )}

        {!isLoading && hasSearched && (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {totalResults} résultat{totalResults > 1 ? 's' : ''}
            </p>

            {totalResults === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Aucun résultat trouvé</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Essayez avec d'autres mots-clés
                </p>
              </div>
            ) : searchType === 'books' ? (
              <div className="space-y-3">
                {bookResults.map((livre) => (
                  <NewBookCard
                    key={livre.id}
                    livre={livre}
                  />
                ))}
              </div>
            ) : (
              // Affichage des bibliothèques - version compacte
              <div className="space-y-3">
                {libraryResults.map((library) => {
                  const imageUrl = getLibraryImageUrl(library.library_image);
                  return (
                    <div
                      key={library.id}
                      onClick={() => router.visit(`/libraries/${library.id}`)}
                      className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer active:opacity-80 transition-all flex gap-3"
                    >
                      {/* Image miniature */}
                      <div className="w-14 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={library.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white opacity-80" />
                          </div>
                        )}
                      </div>
                      
                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {library.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-orange-500 flex-shrink-0" />
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {library.adress || 'Adresse non renseignée'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            📚 {library.books_count || 0} livres
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            👥 {library.members_count || 0} membres
                          </span>
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
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {searchType === 'books' 
                ? "Recherchez un livre, un auteur ou un genre"
                : "Recherchez une bibliothèque"
              }
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Trouvez votre prochaine lecture
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}