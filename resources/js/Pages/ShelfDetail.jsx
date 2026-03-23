import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, MoreHorizontal, Edit2, Trash2, BookOpen, X } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import NewBookCard from '@/Components/NewBookCard';

export default function ShelfDetail() {
  const { props } = usePage();
  const { id } = props;
  const [shelf, setShelf] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const shelves = JSON.parse(localStorage.getItem('shelves') || '[]');
    const foundShelf = shelves.find(s => s.id === parseInt(id));
    setShelf(foundShelf);
  }, [id]);

  const handleEdit = () => {
    setShowMenu(false);
    router.visit(`/shelves/${id}/edit`);
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (confirm('Voulez-vous vraiment supprimer cette étagère ?')) {
      const shelves = JSON.parse(localStorage.getItem('shelves') || '[]');
      const updatedShelves = shelves.filter(s => s.id !== parseInt(id));
      localStorage.setItem('shelves', JSON.stringify(updatedShelves));
      router.visit('/shelves');
    }
  };

  if (!shelf) {
    return (
      <MobileLayout>
        <div className="px-6 py-4">
          <p className="text-gray-500">Chargement...</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.visit('/shelves')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{shelf.nom}</h1>
              <p className="text-sm text-gray-400">
                {shelf.livreCount} livre{shelf.livreCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowMenu(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreHorizontal className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <div className="mb-6">
          <img
            src={shelf.image}
            alt={shelf.nom}
            className="w-full h-72 object-cover rounded-xl border-[0.5px] border-white/20"
          />
        </div>

        {shelf.description && (
          <div className="mb-6">
            <p className="text-gray-600 text-sm">{shelf.description}</p>
          </div>
        )}

        {shelf.livres && shelf.livres.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Livres dans cette étagère</h2>
            {shelf.livres.map((livre) => (
              <NewBookCard
                key={livre.id}
                livre={livre}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Aucun livre dans cette étagère</p>
            <button
              onClick={handleEdit}
              className="mt-4 text-purple-600 text-sm font-medium"
            >
              Ajouter des livres
            </button>
          </div>
        )}
      </div>
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50 transition-opacity"
            onClick={() => setShowMenu(false)}
          />
          
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 animate-slide-up">
            <div className="flex justify-center pt-4 pb-2">
              <div 
                className="w-12 h-1 bg-gray-300 rounded-full cursor-pointer"
                onClick={() => setShowMenu(false)}
              />
            </div>
            <div className="px-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Options</h3>
            </div>
            <div className="px-4 py-2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-4 w-full px-4 py-4 hover:bg-gray-300 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-black-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-base font-medium text-gray-900">Modifier</p>
                  <p className="text-sm text-gray-400">Changer le nom, l'image ou les livres</p>
                </div>
              </button>

              <button
                onClick={handleDelete}
                className="flex items-center gap-4 w-full px-4 py-4 hover:bg-gray-300 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-base font-medium text-red-600">Supprimer</p>
                  <p className="text-sm text-gray-400">Cette action est irréversible</p>
                </div>
              </button>
            </div>
            
            <div className="px-6 pb-6 pt-2">
              <button
                onClick={() => setShowMenu(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </>
      )}
    </MobileLayout>
  );
}