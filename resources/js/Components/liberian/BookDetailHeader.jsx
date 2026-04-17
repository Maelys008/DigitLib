import { useState } from 'react';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import { router } from '@inertiajs/react';
import BookBottomSheet from './BookBottomSheet';

export default function BookDetailHeader({ 
  imageUrl, 
  titre, 
  onEdit,
  onDelete,
  className = '' 
}) {
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 h-[450px] w-full overflow-hidden">
        <img 
          src={imageUrl || '/placeholder-book.jpg'} 
          alt=""
          className="w-full h-full object-cover scale-110 blur-xl brightness-70"
        />
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
      </div>
      
      <div className="relative pt-16 pb-8 flex flex-col items-center">
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <button 
            onClick={() => router.visit('/librarian/books')}
            className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-black/30 transition-colors dark:bg-black/30 dark:hover:bg-black/50"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => setShowBottomSheet(true)}
            className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-black/30 transition-colors dark:bg-black/30 dark:hover:bg-black/50"
          >
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>

        <div className="relative z-10 mt-4 shadow-2xl">
          <img 
            src={imageUrl || '/placeholder-book.jpg'} 
            alt={titre}
            className="w-48 h-72 object-cover rounded-sm border-[0.5px] border-white/20"
          />
        </div>
        
        <div className="mt-6 text-center px-6 z-10">
          <h1 className="text-xl font-bold text-white leading-tight">
            {titre}
          </h1>
        </div>
      </div>

      <BookBottomSheet 
        isOpen={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}