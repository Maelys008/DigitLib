import { useState } from 'react';
import { Star } from 'lucide-react';

export default function ReviewCard({ 
  review, 
  variant = 'detail', 
  className = '' 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
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

  const shouldTruncate = review.commentaire.length > 120;
  const displayedComment = isExpanded 
    ? review.commentaire 
    : `${review.commentaire.substring(0, 120)}${shouldTruncate ? '...' : ''}`;

  return (
    <div className={`${variant === 'list' ? 'border-b border-gray-100 last:border-0' : ''}`}>
      <div className={`${variant === 'list' ? 'py-4' : 'bg-gray-50 rounded-xl p-4'} ${className}`}>
        <div className="flex items-start gap-3 mb-2">
          <div className={`w-10 h-10 rounded-full ${getAvatarColor(review.nom)} flex items-center justify-center text-white font-medium text-sm flex-shrink-0`}>
            {getInitials(review.nom)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">{review.nom}</span>
                <p className="text-xs text-gray-400 mt-0.5">{review.date}</p>
              </div>
              
           
						<div className="flex justify-end mt-2">
							{review.note && (
								<div className="flex items-center gap-1 bg-[#1C1C1C] text-white px-2 py-1 rounded-md">
									<span className="text-xs font-medium">{review.note.toFixed(1)}</span>
								</div>
							)}
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