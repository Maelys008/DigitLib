import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { Search, X, ChevronLeft } from 'lucide-react'; 
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
  const [results, setResults] = useState([]);
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
      // Appel API avec le paramètre 'search'
      const response = await api.getBooks({ 
        search: searchTerm.trim(),
        per_page: 50 // Pour avoir plus de résultats
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
        // Pour les auteurs, on regroupe par auteur unique
        const uniqueAuthors = [...new Set(normalizedBooks.map(b => b.auteur))];
        filteredResults = normalizedBooks.filter(book => 
          uniqueAuthors.includes(book.auteur)
        );
      }
      
      setResults(filteredResults);
      setTotalResults(total);
      
    } catch (error) {
      console.error('Erreur recherche:', error);
      setResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = async (filter) => {
    setActiveFilter(filter);
    if (hasSearched && searchTerm.trim()) {
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
        
        setResults(filteredResults);
      } catch (error) {
        console.error('Erreur filtre:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setSearchTerm('');
    setResults([]);
    setHasSearched(false);
    setTotalResults(0);
  };

  const handleBack = () => {
    setHasSearched(false);
    setResults([]);
    setSearchTerm('');
    setTotalResults(0);
  };

  return (
    <MobileLayout>
      <div className="px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {hasSearched && (
            <button 
              onClick={handleBack} 
              className="text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <form onSubmit={handleSearch} className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un livre, un auteur ou un genre"
              className="w-full pl-10 pr-10 py-2.5 bg-gray-100 border-none rounded-xl text-[17px] focus:ring-0 focus:bg-gray-50 placeholder-gray-400"
              autoFocus
            />
            
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-400 rounded-full p-0.5 hover:bg-gray-500 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </button>
            )}
          </form>
          
          {!hasSearched && (
            <button 
              onClick={handleCancel}
              className="text-gray-600 text-[17px] font-normal whitespace-nowrap hover:text-gray-900 transition-colors"
            >
              Annuler
            </button>
          )}
        </div>

        {/* Filtres - seulement après recherche */}
        {hasSearched && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'all' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => handleFilterChange('books')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'books' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Livres
            </button>
            <button
              onClick={() => handleFilterChange('authors')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'authors' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Auteurs
            </button>
            
             <button
              onClick={() => handleFilterChange('genres')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'genres' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
            <div className="w-8 h-8 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        )}

        {!isLoading && hasSearched && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {totalResults} résultat{totalResults > 1 ? 's' : ''}
            </p>

            {results.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Aucun résultat trouvé</p>
                <p className="text-sm text-gray-400 mt-1">
                  Essayez avec d'autres mots-clés
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((livre) => (
                  <NewBookCard
                    key={livre.id}
                    livre={livre}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {!hasSearched && !isLoading && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Recherchez un livre, un auteur ou un genre</p>
            <p className="text-sm text-gray-400 mt-1">
              Trouvez votre prochaine lecture
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}