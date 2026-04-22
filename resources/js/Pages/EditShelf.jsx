import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, ChevronRight, Heart, Loader2 } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { useAuth } from '@/contexts/AuthContext';
import api from '../services/api';

export default function EditShelf() {
    const { props } = usePage();
    const { id } = props;
    const { isAuthenticated } = useAuth();
    const [shelfImage, setShelfImage] = useState(null);
    const [shelfName, setShelfName] = useState('');
    const [shelfDescription, setShelfDescription] = useState('');
    const [favoris, setFavoris] = useState([]);
    const [selectedBooks, setSelectedBooks] = useState([]);
    const [currentBooks, setCurrentBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    // Fonction pour obtenir l'URL complète de l'image avec le port dynamique
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        const port = window.location.port;
        const baseUrl = `${window.location.protocol}//${window.location.hostname}${port ? ':' + port : ''}`;
        
        if (imagePath.startsWith('/storage/')) {
            return `${baseUrl}${imagePath}`;
        }
        return `${baseUrl}/storage/${imagePath}`;
    };

    useEffect(() => {
        if (isAuthenticated && id) {
            loadShelfAndFavorites();
        }
    }, [id, isAuthenticated]);

    const loadShelfAndFavorites = async () => {
        setIsLoading(true);
        try {
            const shelfData = await api.getShelf(id);
            setShelfName(shelfData.name);
            setShelfDescription(shelfData.description || '');
            // Utilise getImageUrl pour l'image
            const imageUrl = getImageUrl(shelfData.shelf_image || shelfData.cover_image);
            setShelfImage(imageUrl);
            setCurrentBooks(shelfData.books || []);
            setSelectedBooks(shelfData.books || []);

            const favoritesData = await api.getFavorites();
            const books = favoritesData.map(fav => fav.book);
            setFavoris(books);
        } catch (error) {
            console.error('Erreur chargement:', error);
        } finally {
            setIsLoading(false);
        }
    };

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

    const handleGoBack = () => {
        window.history.back();
    };

    const handleSave = async () => {
        if (!shelfName.trim()) return;
        
        setIsSubmitting(true);
        
        try {
            await api.updateShelf(id, {
                name: shelfName,
                description: shelfDescription,
                cover_image: shelfImage
            });
            
            const currentBookIds = currentBooks.map(b => b.id);
            const selectedBookIds = selectedBooks.map(b => b.id);
            
            const toRemove = currentBookIds.filter(id => !selectedBookIds.includes(id));
            for (const bookId of toRemove) {
                await api.removeBookFromShelf(id, bookId);
            }
            
            const toAdd = selectedBookIds.filter(id => !currentBookIds.includes(id));
            for (const bookId of toAdd) {
                await api.addBookToShelf(id, bookId);
            }
            
            router.visit(`/shelves/${id}`);
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <MobileLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-orange-500 dark:text-orange-400 animate-spin" />
                </div>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout>
            <div className="px-6 py-4 pb-24">
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={handleGoBack}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier l'étagère</h1>
                </div>

                {/* Image */}
                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image de couverture</p>
                    <div className="flex items-center gap-4">
                        <div 
                            onClick={handleImageClick}
                            className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700"
                        >
                            {shelfImage ? (
                                <img 
                                    src={shelfImage} 
                                    alt="Couverture" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/placeholder-book.jpg';
                                    }}
                                />
                            ) : (
                                <Camera className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                            )}
                        </div>
                        <button
                            onClick={handleImageClick}
                            className="text-sm text-purple-600 dark:text-purple-400 font-medium"
                        >
                            Changer l'image
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
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom de l'étagère *</p>
                    <input
                        type="text"
                        value={shelfName}
                        onChange={(e) => setShelfName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
                    />
                </div>

                {/* Description */}
                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</p>
                    <textarea
                        value={shelfDescription}
                        onChange={(e) => setShelfDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none text-gray-900 dark:text-white"
                    />
                </div>

                {/* Livres favoris */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Livres dans cette étagère
                        </h2>
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                            {selectedBooks.length} livre{selectedBooks.length > 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide pr-2">
                        {favoris.map((livre) => (
                            <div
                                key={livre.id}
                                onClick={() => handleCheckboxChange(livre)}
                                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                                    selectedBooks.some(book => book.id === livre.id)
                                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700'
                                }`}
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <img
                                        src={livre.cover_url || livre.cover_image}
                                        alt={livre.title}
                                        className="w-12 h-16 rounded-lg object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/placeholder-book.jpg';
                                        }}
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                                            {livre.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {livre.author}
                                        </p>
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded border-2 transition-colors ${
                                    selectedBooks.some(book => book.id === livre.id)
                                        ? 'bg-purple-600 border-purple-600'
                                        : 'border-gray-300 dark:border-gray-600'
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
                </div>

                <button
                    onClick={handleSave}
                    disabled={!shelfName || isSubmitting}
                    className="w-full bg-purple-600 dark:bg-purple-500 text-white font-semibold py-4 rounded-xl hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Enregistrement...
                        </>
                    ) : (
                        'Enregistrer les modifications'
                    )}
                </button>
            </div>
        </MobileLayout>
    );
}