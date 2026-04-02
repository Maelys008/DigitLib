import { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import BooksSection from '@/Components/liberian/BooksSection';
import AddBookModal from '@/Components/liberian/AddBookModal';

export default function Books() {
  const { user } = useAuth();
  const [library, setLibrary] = useState(null);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [genres, setGenres] = useState([]);

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
        loadBooks(lib);
      }
    }
    setIsLoading(false);
  }, [user]); 

  const loadBooks = async (lib) => {
    try {
      const response = await api.getBooks({ library_id: lib.id });
      const booksData = response.data?.data || [];
      setBooks(booksData);
    } catch (error) {
      console.error('Erreur chargement livres:', error);
    }
  };

  const handleAddBook = async (formData) => {
    try {
      const response = await api.createBook(formData);
      if (response.success) {
        await loadBooks(library);
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
        await loadBooks(library);
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des livres</h1>
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