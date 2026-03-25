import { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { BookOpen, Calendar, User, Library, Info } from 'lucide-react';
import api from '../../services/api';
import BookDetailHeader from '@/Components/liberian/BookDetailHeader';

export default function BookDetail() {
  const { props } = usePage();
  const { id } = props;
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await api.getBook(id);
        setBook(response);
      } catch (error) {
        console.error('Erreur chargement livre:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleEdit = () => {
    router.visit(`/librarian/books/${id}/edit`);
  };

  const handleDelete = async () => {
    if (confirm('Voulez-vous vraiment supprimer ce livre ?')) {
      try {
        await api.deleteBook(id);
        router.visit('/librarian/books');
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Livre non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BookDetailHeader 
        imageUrl={book.cover_url}
        titre={book.title}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <div className="p-6">
        {/* Auteur */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-500">Auteur</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 mt-1">{book.author}</p>
        </div>

        {/* Genre */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-500">Genre</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 mt-1">{book.genre}</p>
        </div>

        {/* ISBN */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-500">ISBN</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 mt-1">{book.isbn}</p>
        </div>

        {/* Année de publication */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-500">Année de publication</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 mt-1">{new Date(book.year_of_publication).getFullYear()}</p>
        </div>

        {/* Exemplaires */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Library className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-500">Exemplaires</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-lg font-semibold text-gray-900">Total: {book.nb_copy}</p>
            <p className="text-lg font-semibold text-green-600">Disponibles: {book.nb_available}</p>
          </div>
        </div>

        {/* Description */}
        {book.description && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Info className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-500">Description</span>
            </div>
            <p className="text-gray-700 leading-relaxed">{book.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}