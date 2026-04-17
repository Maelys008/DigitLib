import { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function WriteReviewModal({ 
  isOpen, 
  onClose, 
  bookId, 
  bookTitle,
  onReviewCreated 
}) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setComment('');
      setIsSubmitted(false);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation de la note
    if (rating === 0) {
      setError('Veuillez donner une note');
      return;
    }
    
    // Validation du commentaire vide
    if (!comment.trim()) {
      setError('Veuillez écrire un commentaire');
      return;
    }
    
    // Validation de la longueur minimale (10 caractères)
    if (comment.trim().length < 10) {
      setError(`Le commentaire doit contenir au moins 10 caractères (${comment.trim().length}/10)`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.addReview(bookId, {
        rating,
        comment: comment.trim()
      });

      if (res.success) {
        // Récupération correcte des données de l'avis
        let reviewData = res.data;
        
        // Si le backend retourne { review: {...} }
        if (res.data && res.data.review) {
          reviewData = res.data.review;
        }
        
        const formattedReview = {
          id: reviewData.id || Date.now(),
          nom: user?.name || 'Utilisateur',
          note: rating,
          date: new Date().toLocaleDateString('fr-FR'),
          commentaire: comment.trim(),
          likes_count: reviewData.likes_count || 0,
          is_liked: false,
          created_at: reviewData.created_at || new Date().toISOString(),
          user: { name: user?.name || 'Utilisateur' }
        };

        if (onReviewCreated) {
          onReviewCreated(formattedReview);
        }

        setIsSubmitted(true);
        
        // Fermer automatiquement après 2 secondes
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(res.message || 'Erreur lors de l\'ajout de l\'avis');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 top-16 bg-white dark:bg-gray-800 rounded-t-3xl z-50 animate-slide-up overflow-y-auto">
        <div className="flex justify-center pt-4 pb-2 sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <div 
            className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full cursor-pointer"
            onClick={onClose}
          />
        </div>
        
        <div className="px-6 py-8"> 
          {isSubmitted ? (
            <div className="text-center flex flex-col items-center">
              <div className="mb-6 flex justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-32 h-32 text-gray-800 dark:text-gray-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth="1.2"
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" 
                  />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
                Merci pour votre avis
              </h2>
              
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-tight max-w-[250px] mb-8">
                Votre avis peut être pour quelqu'un décisif
              </p>
              <button
                onClick={onClose}
                className="w-full py-4 bg-[#1C1C1C] dark:bg-gray-700 text-white font-medium rounded-2xl hover:bg-black dark:hover:bg-gray-600 transition-all"
              >
                Retourner sur la page du livre
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Avis et note</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{bookTitle}</p>
            
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {rating > 0 ? `${rating} étoile(s)` : 'Tapez pour évaluer'}
                </p>
              </div>

              <div className="mb-6">
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="L'auteur parle simplement et directement des relations complexes... (minimum 10 caractères)"
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border ${
                    comment.length > 0 && comment.length < 10 
                      ? 'border-orange-400 dark:border-orange-500' 
                      : 'border-gray-200 dark:border-gray-600'
                  } rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent`}
                  required
                />
                
                {/* Indicateur de progression des caractères */}
                {comment.length > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Minimum 10 caractères
                      </span>
                      <span className={`text-xs font-medium ${
                        comment.length >= 10 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-orange-500 dark:text-orange-400'
                      }`}>
                        {comment.length}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all duration-300 ${
                          comment.length >= 10 
                            ? 'bg-green-500' 
                            : 'bg-orange-500'
                        }`}
                        style={{ width: `${Math.min((comment.length / 10) * 100, 100)}%` }}
                      />
                    </div>
                    {comment.length < 10 && (
                      <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">
                        Encore {10 - comment.length} caractère{10 - comment.length > 1 ? 's' : ''} minimum
                      </p>
                    )}
                    {comment.length >= 10 && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        ✓ Longueur valide
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={rating === 0 || comment.trim().length < 10 || isSubmitting}
                  className="flex-1 bg-gray-900 dark:bg-gray-700 text-white font-semibold py-3 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed shadow-md"
                >
                  {isSubmitting ? 'Publication...' : 'Publier'}
                </button>
              </div>
              
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
                Votre avis sera visible par tous les utilisateurs
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  ); 
}