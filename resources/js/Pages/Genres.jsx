import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { genreIcons } from '../Constants/genreIcons';
import GenreListItem from '@/Components/GenreListItem';
import { ArrowLeft } from 'lucide-react';
import { Link, router } from '@inertiajs/react'; 
import api from '../services/api';

export default function Genres() {
  const [isLoading, setIsLoading] = useState(true);
  const [genresWithCounts, setGenresWithCounts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const genresResponse = await api.getGenres(); // tu dois avoir une route API qui renvoie tous les genres
        const genres = genresResponse.data || [];
        let allBooks = [];
        let currentPage = 1;
        let hasMore = true;
        while (hasMore) {
          const response = await api.getBooks({ page: currentPage });
          const booksData = response.data?.data || [];
          allBooks = [...allBooks, ...booksData];
          hasMore = response.data?.current_page < response.data?.last_page;
          currentPage++;
        }

        const countsMap = {}; 
        allBooks.forEach(book => {
          const genreName = book.genre?.name;
          if (genreName) {
            countsMap[genreName] = (countsMap[genreName] || 0) + 1;
          }
        });
        const counts = genres.map(g => ({
          genre: g.name,
          count: countsMap[g.name] || 0, 
        }));

        counts.sort((a, b) => a.genre.localeCompare(b.genre));
        setGenresWithCounts(counts);

      } catch (error) {
        console.error('Erreur chargement genres ou livres:', error);

        // fallback vers mockData 
        const { genres: mockGenres, livres: mockBooks } = await import('../data/mockData');
        const countsMap = {};
        mockBooks.forEach(book => {
          if (book.genre) countsMap[book.genre] = (countsMap[book.genre] || 0) + 1;
        });
        const counts = mockGenres.map(g => ({ genre: g, count: countsMap[g] || 0 }));
        setGenresWithCounts(counts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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