import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { Heart, BookOpen, TrendingUp, Star, Calendar, AlertCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import Shelves from './Shelves';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Library() {
  const [activeTab, setActiveTab] = useState('books'); 
  const [favorisCount, setFavorisCount] = useState(0);
  const [lusCount, setLusCount] = useState(0);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();


  useEffect(() => {
    const fetchLoans = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const loans = await api.getLoans();
        console.log('Emprunts reçus:', loans);
        
    
        const booksWithDetails = loans.map(loan => {
          const book = loan.copy?.book;
          if (!book) return null;
          
          // Calculer la progression en fonction des jours
          const loanDate = new Date(loan.loan_date);
          const expectedReturnDate = new Date(loan.expected_return_date);
          const today = new Date();
          const totalDays = Math.ceil((expectedReturnDate - loanDate) / (1000 * 60 * 60 * 24));
          const daysPassed = Math.ceil((today - loanDate) / (1000 * 60 * 60 * 24));
          const progress = Math.min(100, Math.max(0, Math.floor((daysPassed / totalDays) * 100)));
          
          return {
            id: loan.id,
            ...book,
            progress: progress,
            loan_date: loan.loan_date,
            expected_return_date: loan.expected_return_date,
            image_couverture: book.cover_url,
            auteur: book.author,
            titre: book.title
          };
        }).filter(b => b !== null);
        
        setBorrowedBooks(booksWithDetails);
      } catch (error) {
        console.error('Erreur chargement emprunts:', error);
      } finally {
        setIsLoading(false);
      }
      const fetchReservations = async () => {
  try {
    const response = await api.axios.get('/reservations');
    setReservations(response.data);
  } catch (error) {
    console.error('Erreur chargement réservations:', error);
  }
};
    };
    
    fetchLoans();
  }, [user]);
  const [reservations, setReservations] = useState([]);

  // Charger les favoris
  useEffect(() => {
    if (!user) return;

    const favorites = JSON.parse(
      localStorage.getItem(`favorites_${user.id}`) || '[]'
    );
    setFavorisCount(favorites.length);
  }, [user]);

  const getDaysRemaining = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Bibliothèque</h1>
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('books')}
            className={`pb-2 px-1 font-medium text-sm transition-colors ${
              activeTab === 'books'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Tous les livres
          </button>
          <button
            onClick={() => setActiveTab('shelves')}
            className={`pb-2 px-1 font-medium text-sm transition-colors ${
              activeTab === 'shelves'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Étagères
          </button>
        </div>

        {activeTab === 'books' ? (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Mes livres empruntés
                </h2>
                <span className="text-xs text-gray-400">
                  {borrowedBooks.length} livre{borrowedBooks.length > 1 ? 's' : ''}
                </span>
              </div>
              
              {borrowedBooks.length === 0 ? (
                <div className="text-center py-12 bg-[#F6F6F6] rounded-xl">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Aucun livre emprunté</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Les livres que vous emprunterez apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {borrowedBooks.map((book) => {
                    const daysRemaining = getDaysRemaining(book.expected_return_date);
                    const isOverdue = daysRemaining < 0;
                    const isDueSoon = daysRemaining <= 3 && daysRemaining >= 0;
                    
                    return (
                      <div
                        key={book.id}
                        className="bg-[#F6F6F6] rounded-xl p-4 shadow-sm border border-gray-100"
                      >
                        <div className="flex gap-3">
                          <img
                            src={book.image_couverture}
                            alt={book.titre}
                            className="w-16 h-20 rounded-lg object-cover"
                          />
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-base line-clamp-1">
                              {book.titre}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">
                              {book.auteur}
                            </p>
                            
                            {/* Date d'emprunt */}
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                              <Calendar className="w-3 h-3" />
                              <span>Emprunté le {new Date(book.loan_date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            
                            {/* Date de retour */}
                            <div className={`flex items-center gap-2 text-xs mb-2 ${
                              isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-gray-500'
                            }`}>
                              <AlertCircle className="w-3 h-3" />
                              <span>
                                {isOverdue 
                                  ? `En retard de ${Math.abs(daysRemaining)} jour(s)` 
                                  : `À rendre dans ${daysRemaining} jour(s)`
                                }
                              </span>
                            </div>
                            
                            {/* Note */}
                            <div className="flex justify-end mt-2">
                              {book.note && (
                                <div className="flex items-center gap-1 bg-[#1C1C1C] text-white px-2 py-1 rounded-md">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs font-medium">{book.note}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Barre de progression */}
                            <div className="mt-2">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <TrendingUp className="w-3 h-3" />
                                  <span>Progression</span>
                                </div>
                                <span className="text-xs font-semibold text-purple-600">
                                  {book.progress}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all"
                                  style={{ width: `${book.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Statistiques */}
            <div className="mt-6 pt-2">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.visit('/favorites')}
                  className="flex items-center px-4 py-3 bg-[#F6F6F6] rounded-xl w-full transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95"
                >
                  <Heart className="w-5 h-5 text-gray-700 mr-3" />
                  <span className="text-gray-900 font-medium">Favoris</span>
                  <span className="text-gray-900 font-semibold ml-2">({favorisCount})</span>
                </button>
                <button
                  onClick={() => router.visit('/read-books')}
                  className="flex items-center px-4 py-3 bg-[#F6F6F6] rounded-xl w-full transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95"
                >
                  <BookOpen className="w-5 h-5 text-gray-700 mr-3" />
                  <span className="text-gray-900 font-medium">Lus</span>
                  <span className="text-gray-900 font-semibold ml-2">({lusCount})</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <Shelves />
        )}
      </div>
    </MobileLayout>
  );
}