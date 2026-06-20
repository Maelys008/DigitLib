import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, User, BookOpen, Calendar, Loader2, Search, X, CheckCircle, Library } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveLibrary } from '@/contexts/ActiveLibraryContext'; 
import api from '../../services/api';
import BottomNav from '@/Components/BottomNav';

export default function LibraryRecords() {
    const { user } = useAuth();
    const { activeLibrary, isLoading: libraryLoading } = useActiveLibrary(); 
    const [library, setLibrary] = useState(null);
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const loadRecords = async () => {
            if (!user) return;
            
            // 🔥 Utilise la bibliothèque active du Context
            let lib = activeLibrary;
            
            if (!lib) {
                // Fallback: cherche la bibliothèque où l'utilisateur est admin
                const libraries = await api.getUserLibraries();
                lib = libraries.find(l => l.administrator_id === user.id);
            }
            
            if (lib) {
                setLibrary(lib);
                await fetchRecords(lib.id);
            } else {
                setIsLoading(false);
            }
        };
        
        if (!libraryLoading) {
            loadRecords();
        }
    }, [user, activeLibrary, libraryLoading]);

    const fetchRecords = async (libraryId) => {
        setIsLoading(true);
        try {
            const data = await api.getLibraryRecords(libraryId);
            console.log('📋 Casiers récupérés:', data);
            setRecords(data.records || []);
        } catch (error) {
            console.error('Erreur chargement casiers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getSeverityInfo = (severity) => {
        const severities = {
            info: { label: 'Information', icon: 'ℹ️', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
            warning: { label: 'Attention', icon: '⚠️', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
            critical: { label: 'Critique', icon: '🔴', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
            emergency: { label: 'Urgence', icon: '🚨', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
        };
        return severities[severity] || severities.warning;
    };

    // Ne montrer que les signalements NON résolus dans le casier
    const filteredRecords = records.filter(record => {
        // Ne pas afficher les signalements résolus dans le casier
        if (record.status === 'résolue') return false;
        
        const matchesSearch = 
            record.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filter === 'all') return matchesSearch;
        if (filter === 'en_attente') return matchesSearch && record.status === 'en_attente';
        if (filter === 'résolue') return matchesSearch && record.status === 'résolue';
        
        return matchesSearch;
    });

    if (isLoading || libraryLoading) {
        return (
            <>
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
            </>
        );
    }

    if (!library) {
        return (
            <>
                <div className="p-6 text-center">
                    <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Aucune bibliothèque trouvée</p>
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
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Casier bibliothécaire</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {filteredRecords.length} signalement{filteredRecords.length > 1 ? 's' : ''} actif{filteredRecords.length > 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barre de recherche */}
                <div className="px-6 mt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par titre, description ou utilisateur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filtres */}
                <div className="px-6 mt-4">
                    <div className="flex gap-3">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                filter === 'all' ? 'bg-orange-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            Tous ({filteredRecords.length})
                        </button>
                        <button
                            onClick={() => setFilter('en_attente')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                filter === 'en_attente' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            En attente ({filteredRecords.filter(r => r.status === 'en_attente').length})
                        </button>
                    </div>
                </div>

                {/* Liste des casiers - SANS BOUTON DE RÉSOLUTION */}
                <div className="px-6 py-4 space-y-4">
                    {filteredRecords.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
                            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Aucun signalement dans le casier</p>
                            <p className="text-sm text-gray-400 mt-1">Tous les incidents sont résolus</p>
                        </div>
                    ) : (
                        filteredRecords.map((record) => {
                            const severity = getSeverityInfo(record.severity);
                            return (
                                <div
                                    key={record.id}
                                    className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border-l-4 ${
                                        record.severity === 'emergency' ? 'border-red-500' : 'border-orange-500'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${severity.color.split(' ')[0]}`}>
                                            <span className="text-2xl">{severity.icon}</span>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${severity.color}`}>
                                                        {severity.label}
                                                    </span>
                                                    <span className="text-xs text-gray-400">#{record.id}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{new Date(record.date).toLocaleDateString('fr-FR')}</span>
                                                </div>
                                            </div>

                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                {record.title}
                                            </h3>

                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                {record.description}
                                            </p>

                                            {record.user && (
                                                <div className="flex items-center gap-2 mb-2">
                                                    <User className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Signalé par: {record.user?.name}
                                                    </span>
                                                </div>
                                            )}

                                            {record.library && (
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Library className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Bibliothèque: {record.library.name}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex gap-3 mt-4">
                                                <button
                                                    onClick={() => router.visit(`/librarian/library-records/${record.id}`)}
                                                    className="text-sm text-orange-600 font-medium hover:underline"
                                                >
                                                    Voir les détails
                                                </button>
                                                {/* PAS DE BOUTON "Marquer comme résolu" ICI */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            <BottomNav />
        </>
    );
}