import MobileLayout from '@/Layouts/MobileLayout';
import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, BookOpen, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Shelves() {
    const { isAuthenticated } = useAuth();
    const [shelves, setShelves] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fonction pour obtenir l'URL complète de l'image
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        if (imagePath.startsWith('/storage/')) {
            return `http://localhost:8000${imagePath}`;
        }
        return `http://localhost:8000/storage/${imagePath}`;
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchShelves();
        }
    }, [isAuthenticated]);

    const fetchShelves = async () => {
        setIsLoading(true);
        try {
            const data = await api.getShelves();
            console.log('Étagères reçues:', data);
            setShelves(data);
        } catch (error) {
            console.error('Erreur chargement étagères:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateShelf = () => {
        router.visit('/shelves/create');
    };

    const handleShelfClick = (shelfId) => {
        router.visit(`/shelves/${shelfId}`);
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
            <div className="px-6 py-4">
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={() => router.visit('/library')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Étagères</h1>
                </div>

                {shelves.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune étagère pour le moment</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            Créez votre première étagère pour organiser vos livres
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {shelves.map((shelf) => {
                            const imageUrl = getImageUrl(shelf.shelf_image);
                            return (
                                <div
                                    key={shelf.id}
                                    onClick={() => handleShelfClick(shelf.id)}
                                    className="flex flex-col cursor-pointer active:opacity-70 transition-opacity"
                                >
                                    <div className="aspect-square w-full max-w-[140px] mx-auto mb-1.5">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={shelf.name}
                                                className="w-full h-full rounded-lg object-cover shadow-sm"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-book.jpg';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/20 flex items-center justify-center">
                                                <BookOpen className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-[14px] font-bold text-black dark:text-white leading-tight line-clamp-2">
                                            {shelf.name}
                                        </h3>
                                        <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">
                                            {shelf.books_count} livre{shelf.books_count > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="px-4 pb-10">
                    <button
                        onClick={handleCreateShelf}
                        className="w-full bg-[#1C1C1E] dark:bg-orange-500 text-white font-medium py-4 rounded-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Créer une étagère
                    </button>
                </div>
            </div>
        </MobileLayout>
    );
}