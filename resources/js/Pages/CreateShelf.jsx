import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, ChevronRight, Heart } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function CreateShelf() {
  const [shelfImage, setShelfImage] = useState(null);
  const [shelfName, setShelfName] = useState('');
  const [shelfDescription, setShelfDescription] = useState('');
  const [favoris, setFavoris] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const fileInputRef = useRef(null);
// Charger les favoris depuis localStorage
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavoris(favorites);
  }, []);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setShelfImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckboxChange = (livre) => {
    setSelectedBooks(prev => {
      const isSelected = prev.some(book => book.id === livre.id);
      if (isSelected) {
        return prev.filter(book => book.id !== livre.id);
      } else {
        return [...prev, livre];
      }
    });
  };

  const handleCreate = () => {
    const newShelf = {
      id: Date.now(),
      nom: shelfName,
      description: shelfDescription,
      image: shelfImage || "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&h=200&fit=crop",
      livreCount: selectedBooks.length,
      livres: selectedBooks 
    };

    const existingShelves = JSON.parse(localStorage.getItem('shelves') || '[]');
    const updatedShelves = [...existingShelves, newShelf];
    localStorage.setItem('shelves', JSON.stringify(updatedShelves));
    console.log('Étagère créée:', newShelf);
    router.visit('/shelves');
  };

  return (
    <MobileLayout>
      <div className="px-6 py-4">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.visit('/shelves')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Créer une étagère</h1>
        </div>
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Image de couverture</p>
          <div className="flex items-center gap-4">
            <div 
              onClick={handleImageClick}
              className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden border border-gray-200"
            >
              {shelfImage ? (
                <img 
                  src={shelfImage} 
                  alt="Couverture" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-6 h-6 text-gray-400" />
              )}
            </div>
            
            <button
              onClick={handleImageClick}
              className="text-sm text-purple-600 font-medium"
            >
              Ajouter une image
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Nom de l'étagère</p>
          <input
            type="text"
            value={shelfName}
            onChange={(e) => setShelfName(e.target.value)}
            placeholder="Neuf"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        </div>
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
          <textarea
            value={shelfDescription}
            onChange={(e) => setShelfDescription(e.target.value)}
            placeholder="Décrivez votre étagère..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
          />
        </div>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Ajouter des livres depuis les favoris
            </h2>
            <span className="text-sm text-gray-400">
              {favoris.length} disponible{favoris.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide pr-2">
            {favoris.map((livre) => (
              <div
                key={livre.id}
                onClick={() => handleCheckboxChange(livre)}
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:border-purple-200 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={livre.image_couverture}
                    alt={livre.titre}
                    className="w-12 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
                      {livre.titre}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1">
                      {livre.auteur}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-700">{livre.note}</span>
                    </div>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded border-2 transition-colors ${
                  selectedBooks.some(book => book.id === livre.id)
                    ? 'bg-purple-600 border-purple-600'
                    : 'border-gray-300'
                }`}>
                  {selectedBooks.some(book => book.id === livre.id) && (
                    <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
          {selectedBooks.length > 0 && (
            <div className="mt-3 p-3 bg-purple-50 rounded-xl">
              <p className="text-sm text-purple-700">
                {selectedBooks.length} livre{selectedBooks.length > 1 ? 's' : ''} sélectionné{selectedBooks.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
          <button
            onClick={() => router.visit('/favorites')}
            className="flex items-center justify-between w-full mt-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              <span className="text-sm font-medium text-gray-900">Voir tous les favoris</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <button
          onClick={handleCreate}
          disabled={!shelfName}
          className="w-full bg-purple-600 text-white font-semibold py-4 rounded-xl hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Créer l'étagère ({selectedBooks.length} livre{selectedBooks.length > 1 ? 's' : ''} sélectionné{selectedBooks.length > 1 ? 's' : ''})
        </button>
      </div>
    </MobileLayout>
  );
}