import { BookOpen } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function BookCard({ book }) {
  const handleClick = () => {
    router.visit(`/librarian/books/${book.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow border border-gray-100 cursor-pointer"
    >
      <div className="flex gap-3">
        <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {book.cover_image ? (
            <img src={`/storage/${book.cover_image}`} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="w-8 h-8 text-gray-400 m-3" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{book.title}</h3>
          <p className="text-sm text-gray-500">{book.author}</p>
          <p className="text-xs text-gray-400 mt-1">{book.genre?.name}</p> 
          <p className="text-xs text-gray-400 mt-1">
            {book.nb_available} / {book.nb_copy} disponibles
          </p>
        </div>
      </div>
    </div>
  );
}