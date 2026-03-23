import MobileLayout from '@/Layouts/MobileLayout';
import { useState,useEffect } from 'react';
import { Heart, BookOpen, TrendingUp, Star } from 'lucide-react';
import { router } from '@inertiajs/react';
import { empruntsActifs, livres, historiqueEmprunts } from '../data/mockData';
import Shelves from './Shelves';

export default function Library() {
  const [activeTab, setActiveTab] = useState('books'); 
  const [favorisCount, setFavorisCount] = useState(0);
  const [lusCount, setLusCount] = useState(0);
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorisCount(favorites.length);
    setLusCount(historiqueEmprunts.length);
  }, []);
  useEffect(() => {
    const handleFocus = () => {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavorisCount(favorites.length);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
  const borrowedBooks = empruntsActifs.map(emprunt => ({
    ...emprunt.livre,
    progress: Math.floor(Math.random() * 100) // 0-100%
  }));

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
              <div className="space-y-4">
                {borrowedBooks.map((book) => (
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
                        <div className="space-y-2">
													<div className="flex justify-end mt-2">
														{book.note && (
															<div className="flex items-center gap-1 bg-[#1C1C1C] text-white px-2 py-1 rounded-md">
																<span className="text-xs font-medium">{book.note}</span>
															</div>
														)}
													</div>
                          <div>
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
                  </div>
                ))}
              </div>
            </div>

            {/* Statistiques en bas - chiffres à côté du texte */}
							<div className="mt-6 pt-2">
								<div className="flex flex-col gap-2 ">
									<button
										onClick={() => router.visit('/favorites')}
										className="flex items-center px-4 py-3 bg-[#F6F6F6] rounded-xl w-full  rounded-xl transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95"
									>
										<Heart className="w-5 h-5 text-black-600 mr-3" />
										<span className="text-black-700 font-medium">Favoris</span>
										<span className="text-black-700 font-semibold ml-2">({favorisCount})</span>
									</button>
                  <button
										onClick={() => router.visit('/read-books')}
										className="flex items-center px-4 py-3 bg-[#F6F6F6] rounded-xl w-full  rounded-xl transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95"
									>
										<BookOpen className="w-5 h-5 text-black-e-600 mr-3" />
										<span className="text-black-700 font-medium">Lus</span>
										<span className="text-black-700 font-semibold ml-2">({lusCount})</span>
									</button>
								</div>
							</div>
          </>
        ) : (
          /* Vue Étagères  */
         <Shelves />
        )}
      </div>
    </MobileLayout>
  );
}