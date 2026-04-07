import { useState } from 'react';
import { Star, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ReviewCard({ 
  review, 
  variant = 'detail', 
  className = '',
  onLike 
}) {
  const { isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Initialiser les likes depuis localStorage
  const [isLiked, setIsLiked] = useState(() => {
    const likedReviews = JSON.parse(localStorage.getItem('liked_reviews') || '[]');
    return likedReviews.includes(review.id);
  });
  const [likesCount, setLikesCount] = useState(review.likes_count || 0);
  const [isLiking, setIsLiking] = useState(false);

  const userName = review.nom || review.user?.name || review.user_name || 'Utilisateur';
  const commentText = review.commentaire || review.comment || review.content || '';
  const rating = review.note || review.rating || 0;
  const reviewDate = review.date || review.created_at 
    ? new Date(review.created_at).toLocaleDateString('fr-FR') 
    : 'Date inconnue';

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated || isLiking) return;
    
    setIsLiking(true);
    
    // Simuler l'appel API (pas de backend pour les likes)
    setTimeout(() => {
      const likedReviews = JSON.parse(localStorage.getItem('liked_reviews') || '[]');
      
      if (isLiked) {
        // Unlike
        const newLikedReviews = likedReviews.filter(id => id !== review.id);
        localStorage.setItem('liked_reviews', JSON.stringify(newLikedReviews));
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
        if (onLike) onLike(review.id, false);
      } else {
        // Like
        likedReviews.push(review.id);
        localStorage.setItem('liked_reviews', JSON.stringify(likedReviews));
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        if (onLike) onLike(review.id, true);
      }
      setIsLiking(false);
    }, 300);
  };

  const shouldTruncate = commentText.length > 120;
  const displayedComment = isExpanded 
    ? commentText 
    : `${commentText.substring(0, 120)}${shouldTruncate ? '...' : ''}`;

  return (
    <div className={`${variant === 'list' ? 'border-b border-gray-100 last:border-0' : ''}`}>
      <div className={`${variant === 'list' ? 'py-4' : 'bg-gray-50 rounded-xl p-4'} ${className}`}>
        <div className="flex items-start gap-3 mb-2">
          <div className={`w-10 h-10 rounded-full ${getAvatarColor(userName)} flex items-center justify-center text-white font-medium text-sm flex-shrink-0`}>
            {getInitials(userName)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">{userName}</span>
                <p className="text-xs text-gray-400 mt-0.5">{reviewDate}</p>
              </div>
              
              <div className="flex items-center gap-3">
                {rating > 0 && (
                  <div className="flex items-center gap-1 bg-[#1C1C1C] text-white px-2 py-1 rounded-md">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{rating.toFixed(1)}</span>
                  </div>
                )}
                
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className="flex items-center gap-1 hover:bg-gray-100 rounded-full px-2 py-1 transition-colors"
                >
                  <Heart 
                    className={`w-4 h-4 transition-colors ${
                      isLiked 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-400 hover:text-red-500'
                    }`} 
                  />
                  {likesCount > 0 && (
                    <span className="text-xs text-gray-500">{likesCount}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pl-13"> 
          <p className="text-sm text-gray-600 leading-relaxed">
            {displayedComment}
            {shouldTruncate && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-purple-600 text-xs ml-1 hover:text-purple-700 transition-colors"
              >
                {isExpanded ? 'Réduire' : 'Lire la suite'}
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}