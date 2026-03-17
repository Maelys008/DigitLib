// resources/js/Components/GenreListItem.jsx

import { router } from '@inertiajs/react';

export default function GenreListItem({ 
  genre, 
  icon: Icon, 
  bookCount, 
  onClick 
}) {
  
  const handleClick = () => {
    if (onClick) {
      onClick(); // Si onClick est fourni par le parent, on l'utilise
    } else {
      // Sinon, redirige vers la page du genre
      router.visit(`/genres/${encodeURIComponent(genre.toLowerCase())}`);
    }
  };

  return (
    <div 
      onClick={handleClick} // ← Utilise handleClick ici, pas onClick directement
      className="relative bg-[#F5F5F7] rounded-2xl p-4 h-40 w-full cursor-pointer transition-transform active:scale-95 overflow-hidden"
    >
      {/* Texte en haut à gauche */}
      <div className="flex flex-col">
        <span className="text-lg font-bold text-gray-900 leading-tight">
          {genre}
        </span>
        <span className="text-xs text-gray-400 mt-1">
          {bookCount} livres
        </span>
      </div>

      {/* Image/Icône en bas à droite */}
      <div className="absolute bottom-2 right-2 w-20 h-20 flex items-center justify-center">
        {Icon ? (
          <Icon className="w-16 h-16 text-gray-700 opacity-80" />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse" />
        )}
      </div>
    </div>
  );
}