import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Star } from 'lucide-react';
import { router } from '@inertiajs/react';
import NewBookCard from '@/Components/NewBookCard';
import api from '../services/api';

export default function ReadBooks() {
  const [readBooks, setReadBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReturnedLoans = async () => {
      setIsLoading(true);
      try {
        const loans = await api.getLoans();
        
        // Filtrer uniquement les emprunts retournés
        const returned = loans.filter(loan => loan.actual_return_date);
        
        // Extraire les livres
        const books = returned.map(loan => {
          const book = loan.copy?.book;
          if (!book) return null;
          
          return {
            ...book,
            id: loan.id,
            image_couverture: book.cover_url || book.cover_image,
            titre: book.title,
            auteur: book.author,
            returned_date: loan.actual_return_date
          };
        }).filter(b => b !== null);
        
        setReadBooks(books);
        console.log('Livres lus (retournés):', books.length);
        
      } catch (error) {
        console.error('Erreur chargement historique:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReturnedLoans();
  }, []);

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
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
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Historique des lectures</h1>
          </div>
        </div>

        {/* Nombre de livres lus */}
        <p className="text-sm text-gray-500 mb-4">
          {readBooks.length} livre{readBooks.length > 1 ? 's' : ''} déjà lus
        </p>

        {/* Liste des livres lus */}
        {readBooks.length > 0 ? (
          <div className="space-y-3">
            {readBooks.map((livre) => (
              <div key={livre.id} className="relative">
                <NewBookCard livre={livre} />
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  <span>Retourné</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Aucun livre lu pour le moment</p>
            <p className="text-xs text-gray-400 mt-2">
              Les livres que vous aurez lus apparaîtront ici
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}