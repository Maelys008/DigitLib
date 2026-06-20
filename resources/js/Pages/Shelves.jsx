import MobileLayout from '@/Layouts/MobileLayout';
import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, BookOpen, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '@/contexts/AuthContext';
import api from '../services/api';

export default function Shelves() {
    const { isAuthenticated } = useAuth();
    const [shelves, setShelves] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const handleGoBack = () => {
        window.history.back();
    };

    if (isLoading) {
        return (
            <>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-orange-500 dark:text-orange-400 animate-spin" />
                </div>
            </>
        );
    }

    return (
        <>
            <div className="px-4 py-6 md:px-8 md:py-6">
                {/* Header avec bouton Créer à droite (responsive) */}
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button 
                            onClick={handleGoBack}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
                        </button>
                        <h1 className="text-xl md:text-3xl font-bold md:font-black text-gray-900 dark:text-white">
                            Mes Étagères
                        </h1>
                    </div>

                    <button
                        onClick={handleCreateShelf}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl font-bold text-sm md:text-base flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95 hover:-translate-y-1"
                    >
                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="hidden sm:inline">Créer une étagère</span>
                        <span className="sm:hidden">Créer</span>
                    </button>
                </div>

                {shelves.length === 0 ? (
                    /* Vue vide responsif */
                    <div className="flex flex-col items-center justify-center py-16 md:py-32 bg-white dark:bg-gray-800/50 rounded-xl md:rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 md:mb-4">
                            <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-gray-300 dark:text-gray-600" />
                        </div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white text-center">
                            Votre bibliothèque est vide
                        </h2>
                        <p className="text-sm md:text-base text-gray-500 mt-1 md:mt-2 text-center max-w-sm px-4">
                            Commencez par créer une étagère pour organiser vos lectures favorites.
                        </p>
                    </div>
                ) : (
                    /* Grille responsive : 2 sur mobile, 3 sur tablette, 4 sur laptop, 5 sur grand écran */
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
                        {shelves.map((shelf) => {
                            const imageUrl = getImageUrl(shelf.shelf_image);
                            return (
                                <div
                                    key={shelf.id}
                                    onClick={() => handleShelfClick(shelf.id)}
                                    className="group cursor-pointer"
                                >
                                    {/* Container Image avec effet Hover */}
                                    <div className="aspect-[4/3] w-full mb-2 md:mb-4 relative overflow-hidden rounded-xl md:rounded-2xl bg-gray-100 dark:bg-gray-800 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={shelf.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.style.display = 'none';
                                                    const parent = e.target.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center"><svg class="w-8 h-8 md:w-12 md:h-12 text-white opacity-80" stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg></div>';
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                                <BookOpen className="w-8 h-8 md:w-12 md:h-12 text-white opacity-80" />
                                            </div>
                                        )}
                                        {/* Overlay au survol (visible sur desktop) */}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center">
                                            <span className="bg-white text-black px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-xs md:text-sm">
                                                Voir l'étagère
                                            </span>
                                        </div>
                                    </div>

                                    {/* Infos de l'étagère */}
                                    <div className="px-0 md:px-1">
                                        <h3 className="text-sm md:text-lg font-semibold md:font-bold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors truncate">
                                            {shelf.name}
                                        </h3>
                                        <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5 md:mt-1 flex items-center gap-1.5">
                                            <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-orange-500"></span>
                                            {shelf.books_count || 0} livre{shelf.books_count > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}