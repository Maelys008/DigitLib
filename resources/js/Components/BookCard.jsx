import { BookOpen, MapPin, Bookmark, Star } from "lucide-react";
import { router } from "@inertiajs/react";

export default function BookCard({ 
  livre, 
  onClick,
  variant = 'default', 
  showNote = false,
  backgroundColor = null, 
  className = ''
}) {

  // Fonction pour obtenir l'URL correcte de l'image
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-book.jpg';
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/storage/')) {
      return `http://localhost:8000${imagePath}`;
    }
    
    return `http://localhost:8000/storage/${imagePath}`;
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.visit(`/book/${livre.id}`);
    }
  };

  const imageUrl = getImageUrl(livre.image_couverture);

  // Variant pour les sections horizontales (Meilleurs du mois, Nouveautés, Populaires, etc.)
  if (variant === 'horizontal') {
    return (
      <div 
        onClick={handleClick}
        className={`
          min-w-[140px] max-w-[140px] rounded-xl overflow-hidden cursor-pointer 
          transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95
          ${backgroundColor || 'bg-white'}
          ${className}
        `}
      >
        {/* Conteneur carré pour l'image ou fond coloré */}
        <div className={`aspect-square w-full ${!livre.image_couverture && backgroundColor ? 'p-4' : ''}`}>
          {livre.image_couverture ? (
            <img 
              src={imageUrl}
              alt={livre.titre}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-book.jpg';
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center">
              <BookOpen className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-xs font-medium line-clamp-2 px-2">{livre.titre}</span>
            </div>
          )}
        </div>
        <div className="p-2">
          <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-0.5">
            {livre.titre}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-1">
            {livre.auteur}
          </p>
          
          {/* Note optionnelle */}
          {showNote && livre.note && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-700">{livre.note}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Variant pour les cartes avec image de couverture uniquement 
  if (variant === 'cover') {
    return (
      <div 
        onClick={handleClick}
        className={`
          min-w-[100px] rounded-lg overflow-hidden cursor-pointer
          transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95
          ${className}
        `}
      >
        <div className="aspect-[2/3] w-full bg-gray-200">
          {livre.image_couverture ? (
            <img 
              src={imageUrl}
              alt={livre.titre}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-book.jpg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
        <div className="p-1">
          <h4 className="font-medium text-xs line-clamp-2">{livre.titre}</h4>
          <p className="text-xs text-gray-500 line-clamp-1">{livre.auteur}</p>
        </div>
      </div>
    );
  }

  // Variant par défaut 
  return (
    <div 
      onClick={handleClick}
      className={`
        bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer 
        transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95
        ${className}
      `}
    >
      <div className="relative">
        <img 
          src={imageUrl}
          alt={livre.titre}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = '/placeholder-book.jpg';
          }}
        />
        
        <button 
          className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md hover:bg-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            console.log('Bookmark clicked for:', livre.titre);
          }}
        >
          <Bookmark className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
          {livre.titre}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {livre.auteur}
        </p>
        
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <BookOpen className="w-3 h-3" />
          <span>{livre.genre}</span>
        </div>

        {/* Disponibilité */}
        <div className="flex items-center gap-2 text-xs">
          <span className={`px-2 py-1 rounded-full ${
            livre.nb_disponibles > 0 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {livre.nb_disponibles > 0 ? 'Disponible' : 'Indisponible'}
          </span>
          
          {livre.nb_disponibles > 0 && (
            <span className="text-gray-500">
              {livre.nb_disponibles} ex.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}