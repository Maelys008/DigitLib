import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Star, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import NewBookCard from '@/Components/NewBookCard'

const normalizeBook = (book) => ({
  ...book,
  id: book.id,
  image_couverture: book.cover_url || book.cover_image,
  nb_disponibles: book.nb_available,
  note: book.note || 0,
  titre: book.title,
  auteur: book.author,
});

export default function Favorites() {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      // Pour les utilisateurs non connectés, utiliser localStorage
      const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavorites(savedFavorites);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const data = await api.getFavorites();
      // Transformer les données
      const books = data.map(fav => normalizeBook(fav.book));
      setFavorites(books);
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (bookId, e) => {
    e.stopPropagation();
    setRemovingId(bookId);
    
    try {
      const result = await api.toggleFavorite(bookId);
      if (result.success) {
        // Retirer de la liste
        setFavorites(prev => prev.filter(book => book.id !== bookId));
      }
    } catch (error) {
      console.error('Erreur suppression favori:', error);
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-6 py-4 pb-24">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.visit('/library')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-600" />
            <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          {favorites.length} livre{favorites.length > 1 ? 's' : ''} dans vos favoris
        </p>
        
        {favorites.length > 0 ? (
          <div className="space-y-3">
            {favorites.map((livre) => (
              <div key={livre.id} className="relative">
                <NewBookCard
                  livre={livre}
                  onClick={() => router.visit(`/book/${livre.id}`)}
                />
                <button
                  onClick={(e) => handleRemoveFavorite(livre.id, e)}
                  disabled={removingId === livre.id}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {removingId === livre.id ? (
                    <Loader2 className="w-4 h-4 text-bg-[#1C1C1C] animate-spin" />
                  ) : (
                    <Heart className="w-4 h-4 text-bg-[#1C1C1C] fill-gray-900" />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Aucun favori pour le moment</p>
            <p className="text-xs text-gray-400 mt-2">
              Ajoutez des livres en cliquant sur le cœur
            </p>
            <button
              onClick={() => router.visit('/')}
              className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
            >
              Découvrir des livres
            </button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}