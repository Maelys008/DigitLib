// resources/js/Pages/Genres.jsx

import MobileLayout from '@/Layouts/MobileLayout';
import { genres } from '../data/mockData';
import { genreIcons } from '../Constants/genreIcons';
import GenreListItem from '@/Components/GenreListItem';
import { ArrowLeft } from 'lucide-react';
import { Link, router } from '@inertiajs/react'; 
import { getBookCountByGenre } from '../utils/getBookCountByGenre';

export default function Genres() {
  const handleGenreClick = (genre) => {
    // Redirige vers la page du genre
    router.visit(`/genres/${encodeURIComponent(genre.toLowerCase())}`);
  };

  return (
    <MobileLayout>
      {/* En-tête avec bouton retour */}
      <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-100">
        <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Genres</h1>
      </div>

      {/* Liste des genres en grille 2 colonnes */}
      <div className="px-4 pb-10 grid grid-cols-2 gap-3">
        {genres.map((genre) => {
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
                bookCount={getBookCountByGenre(genre)}
              />
            </div>
          );
        })}
      </div>
    </MobileLayout>
  );
}