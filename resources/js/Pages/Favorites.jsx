import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Star } from 'lucide-react';
import { router } from '@inertiajs/react';
import NewBookCard from '@/Components/NewBookCard';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Charger les favoris depuis localStorage
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(savedFavorites);
  }, []);

  return (
    <MobileLayout>
      <div className="px-6 py-4">
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
              <NewBookCard
                key={livre.id}
                livre={livre}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Aucun favori pour le moment</p>
            <p className="text-xs text-gray-400 mt-2">
              Ajoutez des livres en cliquant sur le cœur
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}