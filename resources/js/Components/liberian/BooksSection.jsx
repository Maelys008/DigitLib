import { Plus, BookOpen } from 'lucide-react';
import BookCard from './BookCard';

export default function BooksSection({ books, onAddBook, onEditBook, onDeleteBook }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Mes livres</h2>
        <button
          onClick={onAddBook}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Ajouter un livre
        </button>
      </div>

      {books.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onEdit={onEditBook} onDelete={onDeleteBook} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun livre dans votre bibliothèque</p>
          <button onClick={onAddBook} className="mt-3 text-purple-600 text-sm hover:underline">
            Ajouter votre premier livre
          </button>
        </div>
      )}
    </div>
  );
}