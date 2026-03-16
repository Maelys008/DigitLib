// resources/js/Components/NewBookCard.jsx

import { Heart, Star } from "lucide-react";
import { router } from "@inertiajs/react";
import { useState } from "react";

export default function NewBookCard({ 
  livre, 
  onClick,
  className = '' 
}) {
  const [isLiked, setIsLiked] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.visit(`/book/${livre.id}`);
    }
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <div 
      onClick={handleClick}
      className={`
        flex gap-4 bg-[#F6F6F6] rounded-xl p-3
        shadow-sm hover:shadow-md transition-all cursor-pointer
        ${className}
      `}
    >
     
      <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
        <img 
          src={livre.image_couverture || '/placeholder-book.jpg'} 
          alt={livre.titre}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between">
       
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-gray-900 text-base line-clamp-2 pr-2">
            {livre.titre}
          </h3>
          
					<button
						onClick={handleLikeClick}
						className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
					>
						<Heart 
							className={`w-5 h-5 transition-colors ${
								isLiked 
									? 'fill-[#1C1C1C] text-[#1C1C1C]'  
									: 'text-gray-400 hover:text-[#1C1C1C]'  // Gris, devient rouge au hover
							}`} 
						/>
					</button>
        </div>

        {/* Auteur */}
        <p className="text-sm text-gray-500 line-clamp-1 mb-2">
          {livre.auteur}
        </p>

        {/* Note dans une case noire */}
        <div className="flex justify-end mt-2">
          {livre.note && (
            <div className="flex items-center gap-1 bg-[#1C1C1C] text-white px-2 py-1 rounded-md">
              <span className="text-xs font-medium">{livre.note}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}