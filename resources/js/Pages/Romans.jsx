import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import NewBookCard from '@/Components/NewBookCard';
import { ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../services/api';

const normalizeBook = (book) => ({
  ...book,
  image_couverture: book.cover_url || book.cover_image,
  nb_disponibles: book.nb_available,
  note: book.note || 0,
  titre: book.title,
  auteur: book.author,
  genreName: typeof book.genre === 'string' ? book.genre : book.genre?.name || 'Inconnu',
});

const fetchAllBooks = async () => {
  let allBooks = [];
  let currentPage = 1;
  let hasMore = true;
  
  while (hasMore) {
    try {
      const response = await api.getBooks({ page: currentPage });
      let booksData = [];
      
      if (response.data?.data) {
        booksData = response.data.data;
        hasMore = response.data.current_page < response.data.last_page;
      } else if (Array.isArray(response)) {
        booksData = response;
        hasMore = false;
      } else {
        booksData = [];
        hasMore = false;
      }
      
      allBooks = [...allBooks, ...booksData];
      currentPage++;
      
    } catch (error) {
      console.error('Erreur page', currentPage, ':', error);
      hasMore = false;
    }
  }
  
  return allBooks;
};

export default function Romans() {
  const [livres, setLivres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalBooks, setTotalBooks] = useState(0);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const allBooksData = await fetchAllBooks();
        const normalizedBooks = allBooksData.map(normalizeBook);
        
        const romans = normalizedBooks.filter(l => l.genreName === 'Roman');
        
        console.log('Romans trouvés:', romans.length);
        console.log('Premier livre:', romans[0]);
        
        setLivres(romans);
        setTotalBooks(romans.length);
        
      } catch (error) {
        console.error('Erreur chargement livres:', error);
        setError('Impossible de charger les livres');
        
        const { livres: mockLivres } = await import('../data/mockData');
        const romansMock = mockLivres.filter(l => l.genre === 'Roman');
        setLivres(romansMock);
        setTotalBooks(romansMock.length);
        
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBooks();
  }, []);

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout>
        <div className="px-6 py-4 text-center">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-100 dark:border-gray-700">
        <button 
          onClick={() => router.visit('/')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Romans</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{totalBooks} livres</p>
        </div>
      </div>
      
      {livres.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Aucun roman trouvé</p>
        </div>
      ) : (
        <div className="px-6 py-4 space-y-3">
          {livres.map((livre) => (
            <NewBookCard
              key={livre.id}
              livre={livre}
            />
          ))}
        </div>
      )}
    </MobileLayout>
  );
}