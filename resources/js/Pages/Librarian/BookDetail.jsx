import { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { BookOpen, Calendar, User, Library, Info, QrCode, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function BookDetail() {
  const { props } = usePage();
  const { id } = props;
  const { user } = useAuth(); 
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchBook = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Chargement du livre ID:', id);
      const response = await api.getBook(id);
      console.log('📚 Livre chargé:', response);
      setBook(response);
    } catch (error) {
      console.error('❌ Erreur chargement livre:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id, refreshKey]);

  // 🔥 Vérifie si l'utilisateur est admin (propriétaire de la bibliothèque)
  const isAdmin = () => {
    if (!book || !user) return false;
    return book.library?.administrator_id === user.id;
  };

  const handleEdit = () => {
    if (isAdmin()) {
      router.visit(`/librarian/books/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin()) return;
    if (confirm('Voulez-vous vraiment supprimer ce livre ?')) {
      try {
        await api.deleteBook(id);
        router.visit('/librarian/books');
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleBack = () => {
    router.visit('/librarian/books');
  };

  const handleManageCopies = () => {
    if (isAdmin()) {
      router.visit(`/librarian/books/${book.id}/copies`);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Livre non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* En-tête avec retour */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{book.title}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Détails du livre</p>
              </div>
            </div>
            {/* 🔥 Les boutons ne s'affichent que pour l'admin */}
            {isAdmin() && (
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  title="Recharger"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-6 max-w-4xl mx-auto">
        {/* Image et infos principales */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="md:flex">
            {/* Image */}
            <div className="md:w-1/3 bg-gray-100 dark:bg-gray-700 p-6 flex items-center justify-center">
              {book.cover_image ? (
                <img 
                  src={`/storage/${book.cover_image}`} 
                  alt={book.title}
                  className="w-full max-w-[200px] rounded-lg shadow-md"
                  onError={(e) => {
                    e.target.src = '/placeholder-book.jpg';
                  }}
                />
              ) : (
                <div className="w-full max-w-[200px] h-[280px] bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>
            
            {/* Infos */}
            <div className="md:w-2/3 p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{book.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{book.author}</p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                    <span className="text-purple-800 dark:text-purple-300 text-sm">{book.genre?.name || 'N/A'}</span>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                    <span className="text-blue-800 dark:text-blue-300 text-sm">ISBN: {book.isbn || 'N/A'}</span>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                    <span className="text-orange-800 dark:text-orange-300 text-sm">
                      {book.year_of_publication ? book.year_of_publication : 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Exemplaires</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{book.nb_copy ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Disponibles</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{book.nb_available ?? 0}</p>
                    </div>
                    {/* 🔥 Bouton Gérer les QR codes uniquement pour l'admin */}
                    {isAdmin() && (
                      <button
                        onClick={handleManageCopies}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/50 text-purple-700 dark:text-purple-300 rounded-xl transition-colors"
                      >
                        <QrCode className="w-4 h-4" />
                        Gérer les QR codes
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {book.description && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📖 Description</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{book.description}</p>
          </div>
        )}

        {/* Informations supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <User className="w-4 h-4" />
              <span className="text-sm">Auteur</span>
            </div>
            <p className="font-medium text-gray-900 dark:text-white">{book.author || 'N/A'}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <Library className="w-4 h-4" />
              <span className="text-sm">Bibliothèque</span>
            </div>
            <p className="font-medium text-gray-900 dark:text-white">{book.library?.name || 'N/A'}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">Genre</span>
            </div>
            <p className="font-medium text-gray-900 dark:text-white">{book.genre?.name || 'N/A'}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Année de publication</span>
            </div>
            <p className="font-medium text-gray-900 dark:text-white">
              {book.year_of_publication || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}