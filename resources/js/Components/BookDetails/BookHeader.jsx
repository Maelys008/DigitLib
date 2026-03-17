 // En-tête avec image, retour, like, partage
// resources/js/Components/BookHeader.jsx

import { useState } from 'react';
import { ArrowLeft, MoreHorizontal, MoreVertical } from 'lucide-react';
import { router } from '@inertiajs/react';
import BottomSheet from './BottomSheet';

export default function BookHeader({ 
  imageUrl, 
  titre, 
  onLike, 
  onShare,
  onAddToShelf,
  onDownload,
  onMarkAsRead,
  isLiked: initialLiked = false,
  className = '' 
}) {
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [isLiked, setIsLiked] = useState(initialLiked);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike) onLike(!isLiked);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Image de couverture avec titre superposé */}
      <div className="relative">
        <img 
          src={imageUrl || '/placeholder-book.jpg'} 
          alt={titre}
          className="w-full h-96 object-cover"
        />
        
        {/* Titre superposé en bas de l'image */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            {titre}
          </h1>
        </div>
      </div>
      
      {/* Boutons superposés */}
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        {/* Bouton retour */}
        <button 
          onClick={() => router.visit('/')}
          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        
        {/* Bouton menu 3 points */}
        <button 
          onClick={() => setShowBottomSheet(true)}
          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
          aria-label="Menu"
        >
          <MoreHorizontal className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Bottom Sheet Modal */}
      <BottomSheet 
        isOpen={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        onLike={handleLike}
        isLiked={isLiked}
      />
    </div>
  );
}