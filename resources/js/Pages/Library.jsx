import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { Heart, BookOpen, TrendingUp, Star, Calendar, AlertCircle, Library as LibraryIcon, ChevronRight } from 'lucide-react';
import { router } from '@inertiajs/react';
import Shelves from './Shelves';
import { useAuth } from '@/contexts/AuthContext';
import api from '../services/api';

export default function Library() {
  const [activeTab, setActiveTab] = useState('books'); 
  const [favorisCount, setFavorisCount] = useState(0);
  const [activeLoans, setActiveLoans] = useState([]);  
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Charger les emprunts
  useEffect(() => {
    const fetchLoans = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const loans = await api.getLoans();
        console.log('Emprunts reçus:', loans);
        
        const active = loans.filter(loan => !loan.actual_return_date);
        
        const activeBooksWithDetails = active.map(loan => {
          const book = loan.copy?.book;
          if (!book) return null;
          
          let loanDate = loan.loan_date;
          const expectedReturnDate = new Date(loan.expected_return_date);
          const today = new Date();
          
          if (!loanDate) {
            loanDate = loan.created_at;
          }
          
          const startDate = new Date(loanDate);
          const totalDuration = expectedReturnDate.getTime() - startDate.getTime();
          const elapsedDuration = today.getTime() - startDate.getTime();
          
          let progress = 0;
          
          if (today < startDate) {
            progress = 0;
          }
          else if (today > expectedReturnDate) {
            progress = 100;
          }
          else {
            progress = Math.floor((elapsedDuration / totalDuration) * 100);
            progress = Math.min(99, Math.max(1, progress));
          }
          
          return {
            id: loan.id,
            ...book,
            progress: progress,
            loan_date: loanDate,
            expected_return_date: loan.expected_return_date,
            image_couverture: book.cover_url || book.cover_image,
            auteur: book.author,
            titre: book.title,
            status: loan.status
          };
        }).filter(b => b !== null);
        
        setActiveLoans(activeBooksWithDetails);
        
      } catch (error) {
        console.error('Erreur chargement emprunts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLoans();
  }, [user]);

  // Charger les favoris
  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      try {
        const data = await api.getFavorites();
        setFavorisCount(data.length);
      } catch (error) {
        console.error('Erreur chargement favoris:', error);
        const favorites = JSON.parse(
          localStorage.getItem(`favorites_${user.id}`) || '[]'
        );
        setFavorisCount(favorites.length);
      }
    };
    
    fetchFavorites();
  }, [user]);

  const getDaysRemaining = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'from-red-500 to-orange-500';
    if (progress >= 50) return 'from-orange-500 to-yellow-500';
    if (progress >= 25) return 'from-yellow-500 to-green-500';
    return 'from-green-500 to-emerald-500';
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
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {/* En-tête responsif */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Bibliothèque</h1>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
                Gérez vos emprunts, favoris et étagères
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2 md:mt-0">
              <LibraryIcon className="w-4 h-4" />
              <span>Espace personnel</span>
            </div>
          </div>
        </div>

        {/* Tabs responsives */}
        <div className="flex gap-4 md:gap-6 mb-6 md:mb-8 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('books')}
            className={`pb-2 md:pb-3 px-1 font-medium text-sm md:text-base transition-all ${
              activeTab === 'books'
                ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Tous les livres
          </button>
          <button
            onClick={() => setActiveTab('shelves')}
            className={`pb-2 md:pb-3 px-1 font-medium text-sm md:text-base transition-all ${
              activeTab === 'shelves'
                ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Mes étagères
          </button>
        </div>

        {activeTab === 'books' ? (
          <>
            {/* Section Emprunts en cours - Design Web responsif */}
            <div className="mb-8 md:mb-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                    Emprunts en cours
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Livres que vous avez actuellement empruntés
                  </p>
                </div>
                <div className="mt-2 md:mt-0 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full w-fit">
                  <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                    {activeLoans.length} livre{activeLoans.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              {activeLoans.length === 0 ? (
                <div className="text-center py-12 md:py-16 bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Aucun emprunt en cours</p>
                  <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Les livres que vous emprunterez apparaîtront ici
                  </p>
                  <button
                    onClick={() => router.visit('/')}
                    className="mt-4 md:mt-6 px-5 md:px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                  >
                    Découvrir des livres
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  {activeLoans.map((book) => {
                    const daysRemaining = getDaysRemaining(book.expected_return_date);
                    const isOverdue = daysRemaining < 0;
                    const isDueSoon = daysRemaining <= 3 && daysRemaining >= 0;
                    const progressColor = getProgressColor(book.progress);
                    
                    return (
                      <div
                        key={book.id}
                        onClick={() => router.visit(`/book/${book.id}`)}
                        className="group bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="flex p-3 md:p-4 gap-3 md:gap-4">
                          {/* Image */}
                          <div className="w-20 h-28 md:w-24 md:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                            <img
                              src={book.image_couverture || '/placeholder-book.jpg'}
                              alt={book.titre}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => e.target.src = '/placeholder-book.jpg'}
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg line-clamp-1 group-hover:text-orange-600 transition-colors">
                              {book.titre}
                            </h3>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2 md:mb-3">
                              {book.auteur}
                            </p>
                            
                            <div className="flex items-center gap-2 md:gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Emprunté le {new Date(book.loan_date).toLocaleDateString('fr-FR')}</span>
                              </div>
                            </div>
                            
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium mb-3 ${
                              isOverdue ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 
                              isDueSoon ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 
                              'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            }`}>
                              <AlertCircle className="w-3 h-3" />
                              <span>
                                {isOverdue 
                                  ? `En retard de ${Math.abs(daysRemaining)} jour(s)` 
                                  : `À rendre dans ${daysRemaining} jour(s)`
                                }
                              </span>
                            </div>
                            
                            <div className="mt-2">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Progression</span>
                                </div>
                                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                  {book.progress}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 md:h-2">
                                <div
                                  className={`bg-gradient-to-r ${progressColor} h-1.5 md:h-2 rounded-full transition-all duration-500`}
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

            {/* Section Actions rapides - Design Web responsif */}
            <div className="mt-6 md:mt-8">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4"></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <button
                  onClick={() => router.visit('/favorites')}
                  className="group flex items-center justify-between p-4 md:p-5 bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-orange-200 transition-all"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Heart className="w-5 h-5 md:w-6 md:h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">Mes favoris</h3>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{favorisCount} livre{favorisCount > 1 ? 's' : ''} favoris</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => router.visit('/read-books')}
                  className="group flex items-center justify-between p-4 md:p-5 bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-orange-200 transition-all"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">Déjà lus</h3>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Historique de vos lectures</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
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