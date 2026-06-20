import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Building2, MapPin, Users, BookOpen, Edit2, Trash2, ChevronRight, Loader2, X } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveLibrary } from '@/contexts/ActiveLibraryContext'; 
import api from '../../services/api';
import CreatePartnerModal from '@/Components/liberian/CreatePartnerModal';
import EditPartnerModal from '@/Components/liberian/EditPartnerModal';
import BottomNav from '@/Components/BottomNav';

export default function PartnerLibraries() {
    const { user } = useAuth();
    const { activeLibrary, isLoading: libraryLoading } = useActiveLibrary(); 
    const [library, setLibrary] = useState(null);
    const [libraries, setLibraries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedLibrary, setSelectedLibrary] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadLibraries = async () => {
            if (!user) return;
            
            // 🔥 Récupère la bibliothèque active
            let lib = activeLibrary;
            
            if (!lib) {
                const allLibraries = await api.getUserLibraries();
                lib = allLibraries.find(l => l.administrator_id === user.id);
            }
            
            if (lib) {
                setLibrary(lib);
                await fetchLibraries();
            } else {
                setIsLoading(false);
            }
        };
        
        if (!libraryLoading) {
            loadLibraries();
        }
    }, [user, activeLibrary, libraryLoading]);

    const fetchLibraries = async () => {
        setIsLoading(true);
        try {
            const data = await api.getLibraries();
            setLibraries(data);
        } catch (error) {
            console.error('Erreur chargement bibliothèques:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Vérifie si l'utilisateur est admin (propriétaire de la bibliothèque)
    const isAdmin = library && library.administrator_id === user?.id;

    const handleCreate = async (formData) => {
        try {
            const result = await api.createLibrary(formData);
            if (result.success) {
                await fetchLibraries();
                setShowCreateModal(false);
            }
        } catch (error) {
            console.error('Erreur création:', error);
        }
    };

    const handleUpdate = async (id, formData) => {
        try {
            const result = await api.updateLibrary(id, formData);
            if (result.success) {
                await fetchLibraries();
                setShowEditModal(false);
            }
        } catch (error) {
            console.error('Erreur modification:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!isAdmin) return;
        if (confirm('Voulez-vous vraiment supprimer cette bibliothèque partenaire ?')) {
            try {
                const result = await api.deleteLibrary(id);
                if (result.success) {
                    await fetchLibraries();
                }
            } catch (error) {
                console.error('Erreur suppression:', error);
            }
        }
    };

    const filteredLibraries = libraries.filter(lib =>
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

    return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Bibliothèques partenaires</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {libraries.length} bibliothèque{libraries.length > 1 ? 's' : ''} partenaire{libraries.length > 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        {/* 🔥 Bouton Ajouter uniquement pour l'admin */}
                        {isAdmin && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Ajouter un partenaire
                            </button>
                        )}
                    </div>
                </div>

                {/* Barre de recherche */}
                <div className="px-6 mt-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Rechercher une bibliothèque..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Liste des bibliothèques partenaires */}
                <div className="px-6 py-4 space-y-4">
                    {filteredLibraries.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
                            <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune bibliothèque partenaire</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                Cliquez sur "Ajouter un partenaire" pour commencer
                            </p>
                        </div>
                    ) : (
                        filteredLibraries.map((libraryItem) => (
                            <div
                                key={libraryItem.id}
                                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                                {libraryItem.name}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-3">
                                            <MapPin className="w-4 h-4" />
                                            <span>{libraryItem.adress}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                <BookOpen className="w-4 h-4" />
                                                <span>{libraryItem.books_count || 0} livres</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                <Users className="w-4 h-4" />
                                                <span>{libraryItem.members_count || 0} membres</span>
                                            </div>
                                        </div>
                                        {libraryItem.description && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-2">
                                                {libraryItem.description}
                                            </p>
                                        )}
                                    </div>
                                    {/* 🔥 Boutons d'action uniquement pour l'admin */}
                                    {isAdmin && (
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => {
                                                    setSelectedLibrary(libraryItem);
                                                    setShowEditModal(true);
                                                }}
                                                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(libraryItem.id)}
                                                className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => router.visit(`/librarian/library/${libraryItem.id}`)}
                                                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modals - uniquement si admin */}
            {isAdmin && (
                <>
                    <CreatePartnerModal
                        isOpen={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        onCreate={handleCreate}
                        libraries={libraries}
                    />

                    <EditPartnerModal
                        isOpen={showEditModal}
                        onClose={() => setShowEditModal(false)}
                        onUpdate={handleUpdate}
                        library={selectedLibrary}
                        libraries={libraries}
                    />
                </>
            )}
            <BottomNav />
        </>
    );
}   
       