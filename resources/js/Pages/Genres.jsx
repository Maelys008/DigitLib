// resources/js/Pages/Genres.jsx

import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { genreIcons } from '../Constants/genreIcons';
import GenreListItem from '@/Components/GenreListItem';
import { ArrowLeft } from 'lucide-react';
import { Link, router } from '@inertiajs/react'; 
import { getBookCountByGenre } from '../utils/getBookCountByGenre';
import api from '../services/api';

// Fonction pour récupérer TOUS les livres (toutes les pages)
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

export default function Genres() {
  const [allBooks, setAllBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [genresWithCounts, setGenresWithCounts] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        
        const booksData = await fetchAllBooks();
        
        setAllBooks(booksData);
        
        const uniqueGenres = [...new Set(booksData.map(book => book.genre).filter(Boolean))];
     
        const counts = uniqueGenres.map(genre => ({
          genre,
          count: getBookCountByGenre(genre, booksData)
        }));
        
        
        counts.sort((a, b) => a.genre.localeCompare(b.genre));
        
        setGenresWithCounts(counts);
        
      } catch (error) {
        console.error('Erreur chargement livres:', error);
        
        // Fallback vers mockData
        const { genres: mockGenres } = await import('../data/mockData');
        const counts = mockGenres.map(genre => ({
          genre,
          count: getBookCountByGenre(genre)
        }));
        setGenresWithCounts(counts);
        
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBooks();
  }, []);

  const handleGenreClick = (genre) => {
    router.visit(`/genres/${encodeURIComponent(genre.toLowerCase())}`);
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
        <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Genres</h1>
      </div>
      <div className="px-4 pb-10 grid grid-cols-2 gap-3">
        {genresWithCounts.map(({ genre, count }) => {
          const IconComponent = genreIcons[genre];
          return (
            <div 
              key={genre} 
              onClick={() => handleGenreClick(genre)}
              className="cursor-pointer"
            >
              <GenreListItem
                genre={genre}
                icon={IconComponent}
                bookCount={count}
              />
            </div>
          );
        })}
      </div>
    </MobileLayout>
  );
}