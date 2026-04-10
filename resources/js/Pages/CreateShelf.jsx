import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, ChevronRight, Heart, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function CreateShelf() {
    const { isAuthenticated } = useAuth();
    const [shelfImage, setShelfImage] = useState(null);
    const [shelfName, setShelfName] = useState('');
    const [shelfDescription, setShelfDescription] = useState('');
    const [favoris, setFavoris] = useState([]);
    const [selectedBooks, setSelectedBooks] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    // Charger les favoris depuis l'API
    useEffect(() => {
        if (isAuthenticated) {
            fetchFavorites();
        }
    }, [isAuthenticated]);

    const fetchFavorites = async () => {
        try {
            const data = await api.getFavorites();
            const books = data.map(fav => fav.book);
            setFavoris(books);
        } catch (error) {
            console.error('Erreur chargement favoris:', error);
            // Fallback localStorage
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            setFavoris(favorites);
        }
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

   const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        // Juste pour l'aperçu
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

  const handleCreate = async () => {
    if (!shelfName.trim()) return;
    
    setIsSubmitting(true);
    
    try {
        const formData = new FormData();
        formData.append('name', shelfName);
        if (shelfDescription) formData.append('description', shelfDescription);
        
        // CORRECTION : envoyer 'shelf_image' au lieu de 'cover_image'
        if (fileInputRef.current.files[0]) {
            formData.append('shelf_image', fileInputRef.current.files[0]);
        }
        
        const shelfResult = await api.createShelf(formData);
        
        if (shelfResult.success) {
            const shelfId = shelfResult.data.id;
            
            for (const book of selectedBooks) {
                await api.addBookToShelf(shelfId, book.id);
            }
            
            router.visit('/shelves');
        }
    } catch (error) {
        console.error('Erreur création étagère:', error);
    } finally {
        setIsSubmitting(false);
    }
};

    return (
        <MobileLayout>
            <div className="px-6 py-4 pb-24">
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={() => router.visit('/shelves')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Créer une étagère</h1>
                </div>

                {/* Image */}
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

                {/* Nom */}
                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">Nom de l'étagère *</p>
                    <input
                        type="text"
                        value={shelfName}
                        onChange={(e) => setShelfName(e.target.value)}
                        placeholder="Ex: Mes lectures préférées"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                </div>

                {/* Description */}
                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                    <textarea
                        value={shelfDescription}
                        onChange={(e) => setShelfDescription(e.target.value)}
                        placeholder="Décrivez votre étagère..."
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                    />
                </div>

                {/* Livres favoris */}
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
                                        src={livre.cover_url || livre.cover_image}
                                        alt={livre.title}
                                        className="w-12 h-16 rounded-lg object-cover"
                                        onError={(e) => e.target.src = '/placeholder-book.jpg'}
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
                                            {livre.title}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {livre.author}
                                        </p>
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
                    disabled={!shelfName || isSubmitting}
                    className="w-full bg-purple-600 text-white font-semibold py-4 rounded-xl hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Création...
                        </>
                    ) : (
                        `Créer l'étagère (${selectedBooks.length} livre${selectedBooks.length > 1 ? 's' : ''})`
                    )}
                </button>
            </div>
        </MobileLayout>
    );
}