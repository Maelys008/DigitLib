import { useState, useEffect } from 'react';
import { Building2, MapPin, Clock, BookOpen, Users, Calendar, ArrowLeft, ChevronRight } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import api from '../services/api';
import MobileLayout from '@/Layouts/MobileLayout';
import HorizontalScroll from '@/Components/HorizontalScroll';
import NewBookCard from '@/Components/NewBookCard';
import Pagination from '@/Components/Pagination';
import { useAuth } from '@/contexts/AuthContext';

const normalizeBook = (book) => ({
  ...book,
  image_couverture: book.cover_url || book.cover_image,
  nb_disponibles: book.nb_available,
  note: book.note || 4.0,
  titre: book.title,
  auteur: book.author,
});

export default function LibraryDetails() {
  const { props } = usePage();
  const { id } = props;
  const { user, isAuthenticated } = useAuth();
  
  const [library, setLibrary] = useState(null);
  const [allBooks, setAllBooks] = useState([]);
  const [currentPageBooks, setCurrentPageBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [message, setMessage] = useState(null);
  const [showAllBooks, setShowAllBooks] = useState(false); 
  
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/storage/')) return `http://localhost:8000${imagePath}`;
    return `http://localhost:8000/storage/${imagePath}`;
  };

  useEffect(() => {
    if (id) {
      fetchLibraryDetails();
    }
  }, [id]);

  useEffect(() => {
    if (allBooks.length > 0) {
      const start = (currentPage - 1) * booksPerPage;
      const end = start + booksPerPage;
      setCurrentPageBooks(allBooks.slice(start, end));
    }
  }, [currentPage, allBooks]);

  const fetchLibraryDetails = async () => {
    setIsLoading(true);
    try {
      const libraryData = await api.getLibrary(id);
      setLibrary(libraryData);
      await fetchLibraryBooks(id);
    } catch (error) {
      console.error('Erreur chargement bibliothèque:', error);
      setMessage({ type: 'error', text: 'Impossible de charger la bibliothèque' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLibraryBooks = async (libraryId) => {
    setIsLoadingBooks(true);
    try {
      const response = await api.getBooks({ library_id: libraryId, per_page: 100 });
      const booksData = response.data?.data || [];
      const normalizedBooks = booksData.map(normalizeBook);
      setAllBooks(normalizedBooks);
      
      const pages = Math.ceil(normalizedBooks.length / booksPerPage);
      setTotalPages(pages);
      setCurrentPageBooks(normalizedBooks.slice(0, booksPerPage));
    } catch (error) {
      console.error('Erreur chargement livres:', error);
    } finally {
      setIsLoadingBooks(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (showAllBooks) {
      setShowAllBooks(false);
      setCurrentPage(1);
    } else {
      router.visit('/');
    }
  };

  const handleViewAllBooks = () => {
    setShowAllBooks(true);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!library) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500 dark:text-gray-400">Bibliothèque non trouvée</p>
        </div>
      </MobileLayout>
    );
  }

  const imageUrl = getImageUrl(library.library_image);

  if (showAllBooks) {
    return (
      <MobileLayout>
        <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tous les livres</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{library.name}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {allBooks.length} livre{allBooks.length > 1 ? 's' : ''} disponible{allBooks.length > 1 ? 's' : ''}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Page {currentPage} / {totalPages}
            </p>
          </div>

          {isLoadingBooks ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          ) : currentPageBooks.length > 0 ? (
            <div className="space-y-3">
              {currentPageBooks.map((book) => (
                <NewBookCard key={book.id} livre={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">Aucun livre disponible</p>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="relative h-56 bg-gradient-to-r from-orange-500 to-orange-600 overflow-hidden">
        <button 
          onClick={handleBack}
          className="absolute top-12 left-4 z-20 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={library.name}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            onError={(e) => {
              console.error('Erreur chargement image:', imageUrl);
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="w-16 h-16 text-white/20" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/70 to-orange-600/70" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">{library.name}</h1>
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{library.adress}</span>
              </div>
            </div>
            
            {/* ❌ Bouton "Rejoindre" supprimé - plus de système d'inscriptions */}
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {message && (
          <div className={`mb-4 p-3 rounded-xl ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <Clock className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Durée d'emprunt</p>
              <p className="font-semibold text-gray-900 dark:text-white">{library.loan_duration || 14} jours</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <BookOpen className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Livres disponibles</p>
              <p className="font-semibold text-gray-900 dark:text-white">{allBooks.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <Users className="w-5 h-5 text-green-500 dark:text-green-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Accès</p>
              <p className="font-semibold text-gray-900 dark:text-white">Universel</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <Calendar className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pénalité/jour</p>
              <p className="font-semibold text-gray-900 dark:text-white">{library.daily_penalty_amount || 0} FCFA</p>
            </div>
          </div>
        </div>

        {library.description && (
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-2">À propos de la bibliothèque</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{library.description}</p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 dark:text-white">Livres disponibles</h2>
            <button 
              onClick={handleViewAllBooks}
              className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400 font-medium"
            >
              Voir tous <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {isLoadingBooks ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          ) : currentPageBooks.length > 0 ? (
            <HorizontalScroll>
              {currentPageBooks.slice(0, 10).map((book) => (
                <div key={book.id} className="w-40 flex-shrink-0 cursor-pointer" onClick={() => router.visit(`/book/${book.id}`)}>
                  <img 
                    src={book.image_couverture || '/placeholder-book.jpg'} 
                    alt={book.titre}
                    className="w-full h-48 object-cover rounded-lg mb-2"
                    onError={(e) => e.target.src = '/placeholder-book.jpg'}
                  />
                  <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{book.titre}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{book.auteur}</p>
                </div>
              ))}
            </HorizontalScroll>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">Aucun livre disponible pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}