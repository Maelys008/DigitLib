// resources/js/Components/BookCard.jsx

import { BookOpen, MapPin, Bookmark, Star } from "lucide-react";
import { router } from "@inertiajs/react";

export default function BookCard({ 
  livre, 
  onClick,
  variant = 'default', // 'default', 'horizontal', 'cover', 'small'
  showNote = false,
  showBadge = false,
  badgeText = 'Par abonnement',
  backgroundColor = null, // Pour les cartes avec fond coloré (rose, vert, etc.)
  className = ''
}) {

 


  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.visit(`/book/${livre.id}`);
    }
  };

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
              src={livre.image_couverture} 
              alt={livre.titre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center">
              <BookOpen className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-xs font-medium line-clamp-2 px-2">{livre.titre}</span>
            </div>
          )}
        </div>

        {/* Infos compactes */}
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
          
          {/* Badge optionnel */}
          {showBadge && (
            <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
              {badgeText}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Variant pour les cartes avec image de couverture uniquement (comme dans certaines maquettes)
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
              src={livre.image_couverture} 
              alt={livre.titre}
              className="w-full h-full object-cover"
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

  // Variant par défaut (version complète pour les pages de détail, catalogue, etc.)
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
          src={livre.image_couverture || '/placeholder-book.jpg'} 
          alt={livre.titre}
          className="w-full h-48 object-cover"
        />
        
        <button 
          className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md hover:bg-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Handle bookmark
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