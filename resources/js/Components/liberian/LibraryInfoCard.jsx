import { Library as LibraryIcon } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function LibraryInfoCard({ library }) {
  const handleClick = () => {
    router.visit(`/librarian/library/${library.id}`);
  };

  // ✅ Fonction pour obtenir l'URL correcte de l'image
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Si c'est déjà une URL complète
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Si le chemin commence par /storage/
    if (imagePath.startsWith('/storage/')) {
      return imagePath;
    }
    
    // Sinon, ajouter /storage/ devant
    return `/storage/${imagePath}`;
  };

  const imageUrl = getImageUrl(library.library_image);

  return (
    <div 
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 flex items-center gap-4 mb-6 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={library.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Erreur chargement image:', imageUrl);
              e.target.style.display = 'none';
              // Afficher l'icône de fallback
              const parent = e.target.parentElement;
              if (parent) {
                const icon = parent.querySelector('.fallback-icon');
                if (icon) icon.style.display = 'flex';
              }
            }}
          />
        ) : null}
        
        {/* Icône de fallback */}
        <div 
          className="fallback-icon w-full h-full flex items-center justify-center"
          style={{ display: imageUrl ? 'none' : 'flex' }}
        >
          <LibraryIcon className="w-8 h-8 text-purple-500 dark:text-purple-400" />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{library.name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{library.adress}</p>
      </div>
    </div>
  );
}