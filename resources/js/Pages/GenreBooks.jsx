import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { usePage, router } from '@inertiajs/react';
import NewBookCard from '@/Components/NewBookCard';
import VerticalScroll from '@/Components/VerticalScroll';
import api from '../services/api';

const normalizeBook = (book) => ({
  ...book,
  image_couverture: book.cover_url || book.cover_image,
  nb_disponibles: book.nb_available,
  note: book.note || 4.0,
  titre: book.title,
  auteur: book.author,
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

export default function GenreBooks() {
  const { props } = usePage();
  const { genre } = props;
  const [livres, setLivres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalBooks, setTotalBooks] = useState(0);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        console.log('Genre recherché:', genre);
        
       
        const allBooksData = await fetchAllBooks();
        console.log('Tous les livres:', allBooksData.map(b => ({ titre: b.title, genre: b.genre })));
        
     
        const normalizedBooks = allBooksData.map(normalizeBook);
        
        const filteredBooks = normalizedBooks.filter(l => {
          const bookGenre = l.genre?.toLowerCase().trim();
          const searchGenre = genre?.toLowerCase().trim();
          const match = bookGenre === searchGenre;
          if (match) {
            console.log('Match trouvé:', l.titre, 'Genre:', l.genre);
          }
          return match;
        });
        
        console.log('Livres filtrés:', filteredBooks.length);
        
        setLivres(filteredBooks);
        setTotalBooks(filteredBooks.length);
        
      } catch (error) {
        console.error('Erreur chargement livres:', error);
        setError('Impossible de charger les livres');
        
        const { livres: mockLivres } = await import('../data/mockData');
        const filteredMock = mockLivres.filter(l => 
          l.genre?.toLowerCase().trim() === genre?.toLowerCase().trim()
        );
        setLivres(filteredMock);
        setTotalBooks(filteredMock.length);
        
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBooks();
  }, [genre]);

  const handleGoBack = () => {
    router.visit('/genres');
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-100">
        <button 
          onClick={handleGoBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{genre}</h1>
          <p className="text-sm text-gray-500 mt-1">{totalBooks} livres</p>
        </div>
      </div>
      <div className="px-6 py-4">
        <VerticalScroll>
          {livres.map((livre) => (
            <NewBookCard
              key={livre.id}
              livre={livre}
            />
          ))}
        </VerticalScroll>
      </div>
    </MobileLayout>
  );
}