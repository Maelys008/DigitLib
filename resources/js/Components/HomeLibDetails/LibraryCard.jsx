import { Building2, BookOpen, Users, Clock, MapPin } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function LibraryCard({ library }) {
  const handleClick = () => {
    router.visit(`/libraries/${library.id}`);
  };

  // Fonction pour obtenir l'URL complète de l'image
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/storage/')) return `http://localhost:8000${imagePath}`;
    return `http://localhost:8000/storage/${imagePath}`;
  };

  const imageUrl = getImageUrl(library.library_image);
  console.log('LibraryCard - Image URL:', imageUrl); 

  return (
    <div 
      onClick={handleClick}
      className="w-72 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all flex-shrink-0"
    >
      {/* Image d'arrière-plan */}
      <div className="relative h-28 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={library.name}
            className="w-full h-full object-cover opacity-40"
            onError={(e) => {
              console.error('Erreur chargement image:', imageUrl);
              e.target.style.display = 'none';
              e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Icône de fallback */}
        <div className={`absolute inset-0 flex items-center justify-center ${imageUrl ? 'fallback-icon' : ''}`} style={imageUrl ? { display: 'none' } : {}}>
          <Building2 className="w-12 h-12 text-white/30" />
        </div>
        
        <div className="absolute inset-0 bg-black/10" />
      </div>
      
      {/* Contenu de la carte */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">
          {library.name}
        </h3>
        <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
          <MapPin className="w-3 h-3" />
          <span className="line-clamp-1">{library.adress}</span>
        </div>
        
        {/* Statistiques */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-600">
              {library.books_count || 0} livres
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-600">
              {library.members_count || 0} membres
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-600">
              {library.loan_duration || 14} jours
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}