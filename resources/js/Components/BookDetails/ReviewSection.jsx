import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import SectionHeader from '@/Components/SectionHeader';
import ReviewCard from './ReviewCard';
import HorizontalScroll from '@/Components/HorizontalScroll';
import WriteReviewModal from './WriteReviewModal';
import api from '../../services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function ReviewSection({ 
  reviews: initialReviews, 
  bookId,
  bookTitle,
  className = '',
  onReviewAdded 
}) {
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les avis depuis l'API 
  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await api.getBookReviews(bookId);
      
      let reviewsData = [];
      if (response?.data) {
        reviewsData = response.data;
      } else if (Array.isArray(response)) {
        reviewsData = response;
      }
      
      // Récupérer les likes depuis localStorage
      const likedReviews = JSON.parse(localStorage.getItem('liked_reviews') || '[]');
      
      const formattedReviews = reviewsData.map(review => ({
        id: review.id,
        nom: review.user?.name || 'Utilisateur',
        note: review.rating,
        date: new Date(review.created_at).toLocaleDateString('fr-FR'),
        commentaire: review.comment,
        likes_count: review.likes_count || 0,
        is_liked: likedReviews.includes(review.id),
        created_at: review.created_at
      }));
      
      setReviews(formattedReviews);
    } catch (error) {
      console.error('Erreur chargement avis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [bookId]); // ← Recharger quand bookId change

  const handleReviewCreated = (newReview) => {
    // Ajouter le nouvel avis à la liste
    setReviews(prev => [newReview, ...prev]);
    
    // Recharger depuis l'API pour être sûr d'avoir la bonne note
    fetchReviews();
    
    // Appeler la fonction du parent
    if (onReviewAdded) {
      onReviewAdded(newReview);
    }
  };

  if (isLoading) {
    return (
      <div className={`mb-6 ${className}`}>
        <SectionHeader titre="Avis" voirToutLien={`/book/${bookId}/reviews`} />
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-6 ${className}`}>
      <SectionHeader 
        titre="Avis" 
        voirToutLien={`/book/${bookId}/reviews`}
      />
      
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

      <WriteReviewModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bookId={bookId}
        bookTitle={bookTitle}
        onReviewCreated={handleReviewCreated}
      />
    </div>
  );
}