import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Building2, MapPin, Users, BookOpen, Edit2, Trash2, ChevronRight, Loader2, X, Calendar, Clock } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveLibrary } from '@/contexts/ActiveLibraryContext'; 
import api from '../../services/api';
import BottomNav from '@/Components/BottomNav';
import CreateChildLibraryModal from '@/Components/liberian/CreateChildLibraryModal';

export default function ChildLibraries() {
    const { user } = useAuth();
    const { activeLibrary, isLoading: libraryLoading } = useActiveLibrary(); 
    const [library, setLibrary] = useState(null);
    const [childLibraries, setChildLibraries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [availableLibraries, setAvailableLibraries] = useState([]);

    // Fonction pour obtenir l'URL complète de l'image
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

    // 🔥 Charger toutes les bibliothèques disponibles pour le modal
    useEffect(() => {
        const loadAvailableLibraries = async () => {
            try {
                const data = await api.getLibraries();
                setAvailableLibraries(data);
            } catch (error) {
                console.error('Erreur chargement bibliothèques:', error);
            }
        };
        loadAvailableLibraries();
    }, []);

    useEffect(() => {
        const loadChildLibraries = async () => {
            if (!user) return;
            
            let lib = activeLibrary;
            
            if (!lib) {
                const allLibraries = await api.getUserLibraries();
                lib = allLibraries.find(l => l.administrator_id === user.id);
            }
            
            if (lib) {
                setLibrary(lib);
                await fetchChildLibraries();
            } else {
                setIsLoading(false);
            }
        };
        
        if (!libraryLoading) {
            loadChildLibraries();
        }
    }, [user, activeLibrary, libraryLoading]);

   const fetchChildLibraries = async () => {
    setIsLoading(true);
    try {
        // 🔥 Utiliser la route /libraries qui existe déjà
        const data = await api.getLibraries();
        // Filtrer les bibliothèques qui ont un parent_id
        const children = data.filter(lib => lib.parent_id !== null);
        setChildLibraries(children);
    } catch (error) {
        console.error('Erreur chargement bibliothèques filles:', error);
        setChildLibraries([]);
    } finally {
        setIsLoading(false);
    }
};
    // 🔥 Modifié : Rattacher une bibliothèque existante (update, pas create)
    const handleCreateChild = async (libraryId, formData) => {
        try {
            const result = await api.updateLibrary(libraryId, formData);
            if (result.success) {
                await fetchChildLibraries();
                setShowCreateModal(false);
            }
        } catch (error) {
            console.error('Erreur rattachement bibliothèque:', error);
        }
    };

    // Vérifie si l'utilisateur est admin
    const isAdmin = library && library.administrator_id === user?.id;

    const filteredLibraries = childLibraries.filter(lib =>
        lib.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lib.adress?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading || libraryLoading) {
        return (
            <>
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="w-8 h-8 text-orange-500 dark:text-orange-400 animate-spin" />
                </div>
            </>
        );
    }

    if (!library) {
        return (
            <>
                <div className="p-6 text-center">
                    <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">Aucune bibliothèque trouvée</p>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => router.visit('/librarian/dashboard')}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Bibliothèques filles</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {childLibraries.length} bibliothèque{childLibraries.length > 1 ? 's' : ''} fille{childLibraries.length > 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Rattacher
                            </button>
                        )}
                    </div>
                </div>

                {/* Barre de recherche */}
                <div className="px-6 mt-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Rechercher une bibliothèque fille..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Liste des bibliothèques filles */}
                <div className="px-6 py-4 space-y-4">
                    {filteredLibraries.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
                            <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune bibliothèque fille</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                {isAdmin ? 'Cliquez sur "Rattacher" pour rattacher une bibliothèque' : 'Aucune bibliothèque n\'est rattachée'}
                            </p>
                        </div>
                    ) : (
                        filteredLibraries.map((childLib) => {
                            const imageUrl = getImageUrl(childLib.library_image);
                            return (
                                <div
                                    key={childLib.id}
                                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
                                >
                                    <div className="flex flex-col sm:flex-row">
                                        {/* Image */}
                                        <div className="w-full sm:w-32 h-40 sm:h-auto flex-shrink-0 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={childLib.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.style.display = 'none';
                                                        const parent = e.target.parentElement;
                                                        if (parent) {
                                                            parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center"><Building2 className="w-12 h-12 text-white opacity-80" /></div>';
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                                    <Building2 className="w-12 h-12 text-white opacity-80" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Informations */}
                                        <div className="flex-1 p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                                        {childLib.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mt-1">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{childLib.adress || 'Adresse non renseignée'}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => router.visit(`/librarian/library/${childLib.id}`)}
                                                    className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {childLib.description && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                                                    {childLib.description}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                    <BookOpen className="w-4 h-4" />
                                                    <span>{childLib.books_count || 0} livres</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                    <Users className="w-4 h-4" />
                                                    <span>Accès universel</span>
                                                </div>
                                                {childLib.loan_duration && (
                                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{childLib.loan_duration} jours</span>
                                                    </div>
                                                )}
                                                {childLib.daily_penalty_amount > 0 && (
                                                    <div className="flex items-center gap-1 text-red-500 dark:text-red-400">
                                                        <span>Pénalité: {childLib.daily_penalty_amount} FCFA/jour</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Modal de rattachement */}
            <CreateChildLibraryModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateChild}
                parentLibrary={library}
                availableLibraries={availableLibraries}
            />

            <BottomNav />
        </>
    );
}