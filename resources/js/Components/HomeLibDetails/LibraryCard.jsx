import { Building2, BookOpen, Users, Clock, MapPin } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function LibraryCard({ library }) {
  const handleClick = () => {
    router.visit(`/libraries/${library.id}`);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    if (imagePath.startsWith('/storage/')) {
      return imagePath;
    }
    return `/storage/${imagePath}`;
  };

  const imageUrl = getImageUrl(library.library_image);

  return (
    <div 
      onClick={handleClick}
      className="w-72 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-md transition-all flex-shrink-0"
    >
      {/* Image visible */}
      <div className="relative h-28 overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={library.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Erreur chargement image:', imageUrl);
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              if (parent) {
                const fallback = parent.querySelector('.fallback-icon');
                if (fallback) fallback.style.display = 'flex';
              }
            }}
          />
        ) : null}
        
        {/* Fallback si pas d'image */}
        <div 
          className="absolute inset-0 flex items-center justify-center w-full h-full bg-gradient-to-br from-orange-400 to-orange-600"
          style={imageUrl ? { display: 'none' } : { display: 'flex' }}
        >
          <Building2 className="w-12 h-12 text-white/50" />
        </div>
      </div>
      
      {/* Contenu de la carte */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 line-clamp-1">
          {library.name}
        </h3>
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-2">
          <MapPin className="w-3 h-3" />
          <span className="line-clamp-1">{library.adress}</span>
        </div>
        
        {/* Statistiques - sans membres */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {library.books_count || 0} livres
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-orange-500 dark:text-orange-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {library.loan_duration || 14} jours
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}