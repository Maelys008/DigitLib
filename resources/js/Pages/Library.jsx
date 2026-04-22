import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { Heart, BookOpen, TrendingUp, Star, Calendar, AlertCircle } from 'lucide-react';
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
        
        // FILTRER : Uniquement les emprunts actifs (non retournés)
        const active = loans.filter(loan => !loan.actual_return_date);
        
        console.log('Emprunts actifs:', active.length);
        
        // Traiter les emprunts actifs avec progression basée sur le temps
        const activeBooksWithDetails = active.map(loan => {
          const book = loan.copy?.book;
          if (!book) return null;
          
          // Utiliser loan_date si disponible, sinon created_at
          let loanDate = loan.loan_date;
          const expectedReturnDate = new Date(loan.expected_return_date);
          const today = new Date();
          
          // Si loan_date est null (emprunt pas encore récupéré), on utilise la date de création
          if (!loanDate) {
            loanDate = loan.created_at;
          }
          
          const startDate = new Date(loanDate);
          
          // Calcul de la progression basée sur le temps écoulé
          const totalDuration = expectedReturnDate.getTime() - startDate.getTime();
          const elapsedDuration = today.getTime() - startDate.getTime();
          
          let progress = 0;
          
          // Si la date de début est dans le futur
          if (today < startDate) {
            progress = 0;
          }
          // Si la date de fin est dépassée
          else if (today > expectedReturnDate) {
            progress = 100;
          }
          // Calcul normal
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
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Bibliothèque</h1>
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('books')}
            className={`pb-2 px-1 font-medium text-sm transition-colors ${
              activeTab === 'books'
                ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Tous les livres
          </button>
          <button
            onClick={() => setActiveTab('shelves')}
            className={`pb-2 px-1 font-medium text-sm transition-colors ${
              activeTab === 'shelves'
                ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Étagères
          </button>
        </div>

        {activeTab === 'books' ? (
          <>
            {/* SECTION EMPRUNTS EN COURS */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Mes emprunts en cours
                </h2>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {activeLoans.length} livre{activeLoans.length > 1 ? 's' : ''}
                </span>
              </div>
              
              {activeLoans.length === 0 ? (
                <div className="text-center py-12 bg-[#F6F6F6] dark:bg-gray-800 rounded-xl">
                  <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Aucun emprunt en cours</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Les livres que vous emprunterez apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeLoans.map((book) => {
                    const daysRemaining = getDaysRemaining(book.expected_return_date);
                    const isOverdue = daysRemaining < 0;
                    const isDueSoon = daysRemaining <= 3 && daysRemaining >= 0;
                    const progressColor = getProgressColor(book.progress);
                    
                    return (
                      <div
                        key={book.id}
                        onClick={() => router.visit(`/book/${book.id}`)}
                        className="bg-[#F6F6F6] dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all"
                      >
                        <div className="flex gap-3">
                          <img
                            src={book.image_couverture || '/placeholder-book.jpg'}
                            alt={book.titre}
                            className="w-16 h-20 rounded-lg object-cover"
                            onError={(e) => e.target.src = '/placeholder-book.jpg'}
                          />
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-base line-clamp-1">
                              {book.titre}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              {book.auteur}
                            </p>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                              <Calendar className="w-3 h-3" />
                              <span>Emprunté le {new Date(book.loan_date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            
                            <div className={`flex items-center gap-2 text-xs mb-2 ${
                              isOverdue ? 'text-red-600 dark:text-red-400' : isDueSoon ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'
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
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <TrendingUp className="w-3 h-3" />
                                  <span>Temps écoulé</span>
                                </div>
                                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                  {book.progress}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className={`bg-gradient-to-r ${progressColor} h-2 rounded-full transition-all duration-500`}
                                  style={{ width: `${book.progress}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                La barre augmente chaque jour jusqu'à la date de retour
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* STATISTIQUES */}
            <div className="mt-6 pt-2">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.visit('/favorites')}
                  className="flex items-center px-4 py-3 bg-[#F6F6F6] dark:bg-gray-800 rounded-xl w-full transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95"
                >
                  <Heart className="w-5 h-5 text-gray-700 dark:text-gray-300 mr-3" />
                  <span className="text-gray-900 dark:text-white font-medium">Favoris</span>
                  {favorisCount > 0 && (
                    <span className="ml-auto text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full">
                      {favorisCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => router.visit('/read-books')}
                  className="flex items-center px-4 py-3 bg-[#F6F6F6] dark:bg-gray-800 rounded-xl w-full transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95"
                >
                  <BookOpen className="w-5 h-5 text-gray-700 dark:text-gray-300 mr-3" />
                  <span className="text-gray-900 dark:text-white font-medium">Déjà lus</span>
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