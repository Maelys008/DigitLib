import { Heart, Share2, Loader2 } from 'lucide-react';

export default function BottomSheet({ isOpen, onClose, onLike, isLiked, onShare, isToggling }) {
  if (!isOpen) return null;

  const handleLikeClick = () => {
    onLike();
    
  };

  const handleShareClick = () => {
    onShare();
    
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 animate-slide-up">
        <div className="flex justify-center pt-4 pb-2">
          <div 
            className="w-12 h-1 bg-gray-300 rounded-full cursor-pointer"
            onClick={onClose}
          />
        </div>
        
        <div className="px-6 pb-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Options</h3>
        </div>
        
        <div className="px-4 py-2">
          <button
            onClick={handleLikeClick}
            disabled={isToggling}
            className="flex items-center gap-4 w-full px-4 py-4 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-50"
          >
            {isToggling ? (
              <Loader2 className="w-5 h-5 text-gray-700 animate-spin" />
            ) : (
              <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} />
            )}
            <span className="text-sm text-gray-700">
              {isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            </span>
          </button>

          <button
            onClick={handleShareClick}
            className="flex items-center gap-4 w-full px-4 py-4 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <Share2 className="w-5 h-5 text-gray-700" />
            <span className="text-sm text-gray-700">Partager dans un club</span>
          </button>
        </div>
        
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </>
  );
}