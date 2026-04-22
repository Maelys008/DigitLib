import { useState, useEffect } from 'react';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import { router } from '@inertiajs/react';
import BottomSheet from './BottomSheet';
import ShareToClubModal from './ShareToClubModal';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function BookHeader({ 
  imageUrl, 
  titre, 
  auteur,
  bookId,
  onLike, 
  isLiked: initialLiked = false,
  className = '' 
}) {
  const { isAuthenticated } = useAuth();
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isToggling, setIsToggling] = useState(false);

  // Vérifier le statut du favori au chargement
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isAuthenticated || !bookId) return;
      try {
        const result = await api.isFavorite(bookId);
        setIsLiked(result.is_favorite);
      } catch (error) {
        console.error('Erreur vérification favori:', error);
      }
    };
    checkFavoriteStatus();
  }, [bookId, isAuthenticated]);

  const handleLike = async () => {
    if (!isAuthenticated) return;
    
    setIsToggling(true);
    try {
      const result = await api.toggleFavorite(bookId);
      if (result.success) {
        const newState = result.data.favorited;
        setIsLiked(newState);
        if (onLike) onLike(newState);
      }
    } catch (error) {
      console.error('Erreur like:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleShare = () => {
    setShowBottomSheet(false);
    setShowShareModal(true);
  };

  return (
    <>
      <div className={`relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 h-[450px] w-full overflow-hidden">
          <img 
            src={imageUrl || '/placeholder-book.jpg'} 
            alt=""
            className="w-full h-full object-cover scale-110 blur-xl brightness-70"
          />
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
        </div>
        <div className="relative pt-16 pb-8 flex flex-col items-center">
          <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
            <button 
              onClick={() => router.visit('/')}
              className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white dark:bg-black/30"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <button 
              onClick={() => setShowBottomSheet(true)}
              className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white dark:bg-black/30"
            >
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>

          <div className="relative z-10 mt-4 shadow-2xl">
            <img 
              src={imageUrl || '/placeholder-book.jpg'} 
              alt={titre}
              className="w-48 h-72 object-cover rounded-sm border-[0.5px] border-white/20"
            />
          </div>
          <div className="mt-6 text-center px-6 z-10">
            <h1 className="text-xl font-bold text-white leading-tight">
              {titre}
            </h1>
          </div>
        </div>
      </div>

      <BottomSheet 
        isOpen={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        onLike={handleLike}
        isLiked={isLiked}
        onShare={handleShare}
        isToggling={isToggling}
      />

      <ShareToClubModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        bookId={bookId}
        bookTitle={titre}
        bookAuthor={auteur}
        bookImage={imageUrl}
      />
    </>
  );
}