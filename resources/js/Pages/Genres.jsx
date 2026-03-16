// resources/js/Pages/Genres.jsx

import MobileLayout from '@/Layouts/MobileLayout';
import { genres } from '../data/mockData';
import { genreIcons } from '../Constants/genreIcons';
import GenreListItem from '@/Components/GenreListItem';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

// Données simulées pour le nombre de livres (comme dans l'image)
const getBookCount = (genre) => {
  const counts = {
    'Fiction': '54 720',
    'Science': '39 960',
    'Histoire': '67 220',
    'Classique': '51 400',
    'Mystère': '45 630',
    'Fantasy': '72 150',
    'Romance': '121 540',
    'Horreur': '30 080',
    'Biographie': '83 410',
    'Philosophie': '45 320',
    'Poésie': '38 760',
    'Voyage': '25 680',
    'Cuisine': '18 940',
    'Programmation': '32 450',
    'Art': '27 630',
    'Jeunesse': '99 390',
    'Thriller': '68 720',
    'Développement personnel': '43 210'
  };
  return counts[genre] || '12 345';
};

export default function Genres() {
  return (
    <MobileLayout>
      {/* En-tête avec bouton retour */}
      <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-100">
        <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Genres</h1>
      </div>

					{/* Liste des genres avec séparateurs */}
		<div className="px-4 pb-10 grid grid-cols-2 gap-3">
        {genres.map((genre) => {
          const IconComponent = genreIcons[genre];
          return (
            	<GenreListItem
              key={genre}
              genre={genre}
              icon={IconComponent}
              bookCount={getBookCount(genre)}
            />
          );
        })}
      </div>
    </MobileLayout>
  );
}