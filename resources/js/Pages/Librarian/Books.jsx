import { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import BooksSection from '@/Components/liberian/BooksSection';
import AddBookModal from '@/Components/liberian/AddBookModal';
import Pagination from '@/Components/Pagination'; 

export default function Books() {
  const { user } = useAuth();
  const [library, setLibrary] = useState(null);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [genres, setGenres] = useState([]);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const perPage = 10;

  useEffect(() => {
    const fetchGenres = async () => {
      const { data } = await api.getGenres();
      setGenres(data);
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    if (user) {
      const key = `user_library_${user.id}`;
      const savedLibrary = localStorage.getItem(key);
      if (savedLibrary) {
        const lib = JSON.parse(savedLibrary);
        setLibrary(lib);
        loadBooks(lib, 1);
      }
    }
  }, [user]);

  // Recharger quand la page change
  useEffect(() => {
    if (library) {
      loadBooks(library, currentPage);
    }
  }, [currentPage]);

  const loadBooks = async (lib, page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.getBooks({ 
        library_id: lib.id,
        page: page,
        per_page: perPage
      });
      
      const booksData = response.data?.data || [];
      setBooks(booksData);
      setTotalPages(response.data?.last_page || 1);
      setTotalBooks(response.data?.total || 0);
      
    } catch (error) {
      console.error('Erreur chargement livres:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBook = async (formData) => {
    try {
      const response = await api.createBook(formData);
      if (response.success) {
        // Revenir à la première page après ajout
        setCurrentPage(1);
        await loadBooks(library, 1);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: 'Erreur lors de l\'ajout' };
    }
  };

  const handleEditBook = (book) => {
    console.log('Modifier livre:', book);
  };

  const handleDeleteBook = async (bookId) => {
    if (confirm('Voulez-vous vraiment supprimer ce livre ?')) {
      try {
        await api.deleteBook(bookId);
        await loadBooks(library, currentPage);
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!library) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <button onClick={() => router.visit('/librarian/dashboard')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Gestion des livres</h1>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-500">Aucune bibliothèque trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.visit('/librarian/dashboard')} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des livres</h1>
              <p className="text-sm text-gray-500 mt-1">
                {totalBooks} livre{totalBooks > 1 ? 's' : ''} au total
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <BooksSection 
          books={books}
          onAddBook={() => setShowAddBookModal(true)}
          onEditBook={handleEditBook}
          onDeleteBook={handleDeleteBook}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <AddBookModal 
        isOpen={showAddBookModal}
        onClose={() => setShowAddBookModal(false)}
        onSubmit={handleAddBook}
        libraryId={library.id}
        genres={genres}
      />
    </div>
  );
}