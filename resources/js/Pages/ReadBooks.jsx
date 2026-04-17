import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Calendar, CheckCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function ReadBooks() {
  const { user } = useAuth();
  const [readBooks, setReadBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReturnedLoans = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const loans = await api.getLoans();
        
        const returned = loans.filter(loan => loan.actual_return_date);
        
        const books = returned.map(loan => {
          const book = loan.copy?.book;
          if (!book) return null;
          
          return {
            id: loan.id,
            ...book,
            image_couverture: book.cover_url || book.cover_image,
            titre: book.title,
            auteur: book.author,
            returned_date: loan.actual_return_date
          };
        }).filter(b => b !== null);
        
        setReadBooks(books);
        console.log('Livres déjà lus:', books.length);
        
      } catch (error) {
        console.error('Erreur chargement historique:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReturnedLoans();
  }, [user]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
      <div className="px-6 py-4">
        {/* En-tête avec bouton retour */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.visit('/library')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Déjà lus</h1>
          </div>
        </div>

        {/* Nombre de livres lus */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {readBooks.length} livre{readBooks.length > 1 ? 's' : ''} déjà lu{readBooks.length > 1 ? 's' : ''}
        </p>

        {/* Liste des livres lus */}
        {readBooks.length > 0 ? (
          <div className="space-y-3">
            {readBooks.map((livre) => (
              <div
                key={livre.id}
                className="bg-[#F6F6F6] dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="flex gap-3">
                  {/* Image */}
                  <img
                    src={livre.image_couverture || '/placeholder-book.jpg'}
                    alt={livre.titre}
                    className="w-14 h-20 rounded-lg object-cover"
                    onError={(e) => e.target.src = '/placeholder-book.jpg'}
                  />
                  
                  {/* Informations */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
                      {livre.titre}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {livre.auteur}
                    </p>
                    
                    {/* Date de retour */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Retourné
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>le {formatDate(livre.returned_date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#F6F6F6] dark:bg-gray-800 rounded-xl">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Aucun livre déjà lu</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Les livres que vous aurez retournés apparaîtront ici
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}