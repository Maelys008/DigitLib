import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, User, BookOpen, Calendar, Loader2, Search, X, PenTool } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveLibrary } from '@/contexts/ActiveLibraryContext'; 
import api from '../../services/api';
import BottomNav from '@/Components/BottomNav';

export default function Incidents() {
    const { user } = useAuth();
    const { activeLibrary, isLoading: libraryLoading } = useActiveLibrary(); 
    const [library, setLibrary] = useState(null);
    const [incidents, setIncidents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, perdue, endommagé

    useEffect(() => {
        const loadIncidents = async () => {
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
                await fetchIncidents(lib.id);
            } else {
                setIsLoading(false);
            }
        };
        
        if (!libraryLoading) {
            loadIncidents();
        }
    }, [user, activeLibrary, libraryLoading]);

   const fetchIncidents = async () => {
    setIsLoading(true);
    try {
        // N'envoie pas de paramètre
        const data = await api.getLibraryIncidents();
        console.log('📋 Incidents récupérés:', data);
        setIncidents(data);
    } catch (error) {
        console.error('Erreur chargement incidents:', error);
    } finally {
        setIsLoading(false);
    }
};

    const getIncidentIcon = (description) => {
        if (description?.toLowerCase().includes('perdu')) {
            return '🔴';
        }
        if (description?.toLowerCase().includes('dégradé') || description?.toLowerCase().includes('abîmé')) {
            return '📖';
        }
        return '⚠️';
    };

    const getIncidentColor = (description) => {
        if (description?.toLowerCase().includes('perdu')) {
            return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800';
        }
        if (description?.toLowerCase().includes('dégradé') || description?.toLowerCase().includes('abîmé')) {
            return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-800';
        }
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    };

    const getIncidentLabel = (description) => {
        if (description?.toLowerCase().includes('perdu')) {
            return '📖 Livre perdu';
        }
        if (description?.toLowerCase().includes('dégradé') || description?.toLowerCase().includes('abîmé')) {
            return '⚠️ Livre endommagé';
        }
        return '⏰ Retard prolongé';
    };

    const filteredIncidents = incidents.filter(incident => {
        const matchesSearch = 
            incident.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            incident.loan?.copy?.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            incident.loan?.copy?.book?.author?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filter === 'all') return matchesSearch;
        if (filter === 'perdue') return matchesSearch && incident.description?.toLowerCase().includes('perdu');
        if (filter === 'endommagé') return matchesSearch && (incident.description?.toLowerCase().includes('dégradé') || incident.description?.toLowerCase().includes('abîmé'));
        
        return matchesSearch;
    });

    // Vérifie si l'utilisateur est admin de cette bibliothèque
    const isAdmin = library && library.administrator_id === user?.id;

    // Redirige ou affiche message si l'utilisateur n'est pas admin
    if (!isLoading && !libraryLoading && !isAdmin && library) {
        return (
            <>
                <div className="p-6 text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-700 dark:text-gray-300 font-medium">Accès non autorisé</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Seuls les administrateurs peuvent accéder aux incidents.
                    </p>
                    <button
                        onClick={() => router.visit('/librarian/dashboard')}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
                    >
                        Retour au tableau de bord
                    </button>
                </div>
            </>
        );
    }

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
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Incidents</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {incidents.length} incident{incidents.length > 1 ? 's' : ''} enregistré{incidents.length > 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barre de recherche */}
                <div className="px-6 mt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Rechercher par utilisateur, titre ou auteur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                                <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
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
                                filter === 'all'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            Tous ({incidents.length})
                        </button>
                        <button
                            onClick={() => setFilter('perdue')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                filter === 'perdue'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            Livres perdus ({incidents.filter(i => i.description?.toLowerCase().includes('perdu')).length})
                        </button>
                        <button
                            onClick={() => setFilter('endommagé')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                filter === 'endommagé'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            Livres endommagés ({incidents.filter(i => i.description?.toLowerCase().includes('dégradé') || i.description?.toLowerCase().includes('abîmé')).length})
                        </button>
                    </div>
                </div>

                {/* Liste des incidents */}
                <div className="px-6 py-4 space-y-4">
                    {filteredIncidents.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
                            <AlertTriangle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Aucun incident trouvé</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                {searchTerm ? 'Aucun résultat pour votre recherche' : 'Aucun incident à signaler'}
                            </p>
                        </div>
                    ) : (
                        filteredIncidents.map((incident) => (
                            <div
                                key={incident.id}
                                className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border-l-4 ${
                                    incident.description?.toLowerCase().includes('perdu')
                                        ? 'border-red-500'
                                        : incident.description?.toLowerCase().includes('dégradé') || incident.description?.toLowerCase().includes('abîmé')
                                        ? 'border-orange-500'
                                        : 'border-yellow-500'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icône */}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getIncidentColor(incident.description)}`}>
                                        <span className="text-2xl">{getIncidentIcon(incident.description)}</span>
                                    </div>

                                    {/* Contenu */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getIncidentColor(incident.description)}`}>
                                                    {getIncidentLabel(incident.description)}
                                                </span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    #{incident.id}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                                                <Calendar className="w-3 h-3" />
                                                <span>{new Date(incident.date).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                        </div>

                                        {/* Livre - Titre */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <BookOpen className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {incident.loan?.copy?.book?.title || 'Livre inconnu'}
                                            </h3>
                                        </div>

                                        {/* Auteur du livre */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <PenTool className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {incident.loan?.copy?.book?.author || 'Auteur inconnu'}
                                            </span>
                                        </div>

                                        {/* Utilisateur */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {incident.user?.name || 'Utilisateur inconnu'}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mt-2">
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                {incident.description}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3 mt-4">
                                            <button
                                                onClick={() => router.visit(`/librarian/incidents/${incident.id}`)}
                                                className="text-sm text-orange-600 dark:text-orange-400 font-medium hover:underline"
                                            >
                                                Voir les détails
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <BottomNav />
        </>
    );
}
      
   