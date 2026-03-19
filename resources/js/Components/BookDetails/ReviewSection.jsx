import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import SectionHeader from '@/Components/SectionHeader';
import ReviewCard from './ReviewCard';
import HorizontalScroll from '@/Components/HorizontalScroll';
import WriteReviewModal from './WriteReviewModal'; // ← Import du modal

export default function ReviewSection({ 
  reviews, 
  bookId,
  bookTitle,
  className = '' 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false); // ← État pour le modal

  return (
    <div className={`mb-6 ${className}`}>
      <SectionHeader 
        titre="Avis" 
        voirToutLien={`/book/${bookId}/reviews`}
      />
      
      {/* Avis en horizontal scroll */}
      {reviews.length > 0 ? (
        <HorizontalScroll>
          {reviews.map((review) => (
            <div key={review.id} className="min-w-[280px] max-w-[280px]">
              <ReviewCard review={review} />
            </div>
          ))}
        </HorizontalScroll>
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Aucun avis pour le moment</p>
          <p className="text-xs text-gray-400 mt-1">Soyez le premier à donner votre avis</p>
        </div>
      )}
      
      <button
        onClick={() => setIsModalOpen(true)} 
        className="w-full border border-purple-600 text-purple-600 font-medium py-3 rounded-xl mt-4 hover:bg-purple-50 transition-colors"
      >
        Écrire un avis
      </button>

      {/* Modal */}
      <WriteReviewModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bookId={bookId}
        bookTitle={bookTitle}
      />
    </div>
  );
}