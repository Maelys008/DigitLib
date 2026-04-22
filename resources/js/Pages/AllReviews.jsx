import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, usePage, router } from '@inertiajs/react';
import ReviewCard from '@/Components/BookDetails/ReviewCard';
import api from '../services/api';

export default function AllReviews() {
  const { props } = usePage();
  const { bookId, bookTitle } = props;
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour formater la date correctement
  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date inconnue';
      }
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date inconnue';
    }
  };

  useEffect(() => {
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
        
        console.log('Reviews data:', reviewsData);
        
        const formattedReviews = reviewsData.map(review => ({
          id: review.id,
          nom: review.user?.name || 'Utilisateur',
          note: review.rating,
          date: formatDate(review.created_at),
          commentaire: review.comment,
          likes_count: review.likes_count || 0,
          is_liked: review.is_liked || false,
          created_at: review.created_at
        }));
        
        setReviews(formattedReviews);
      } catch (error) {
        console.error('Erreur chargement avis:', error);
        setError('Impossible de charger les avis');
        
        try {
          const { avis: mockAvis } = await import('../data/mockData');
          const filteredMock = mockAvis.filter(a => a.livre_id === bookId);
          setReviews(filteredMock);
        } catch (mockError) {
          console.error('Erreur chargement mock data:', mockError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReviews();
  }, [bookId]);

  const handleLike = async (reviewId, liked) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            is_liked: liked, 
            likes_count: liked ? review.likes_count + 1 : review.likes_count - 1 
          }
        : review
    ));
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-100 dark:border-gray-700">
        <button 
          onClick={() => router.visit(`/book/${bookId}`)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tous les avis</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{reviews.length} avis</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Aucun avis pour le moment</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Soyez le premier à donner votre avis</p>
        </div>
      ) : (
        <div className="px-6 py-4 divide-y divide-gray-100 dark:divide-gray-700">
          {reviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              variant="list"
              onLike={handleLike}
            />
          ))}
        </div>
      )}
    </MobileLayout>
  );
}