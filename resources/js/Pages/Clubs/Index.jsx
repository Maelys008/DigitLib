import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { Users, Search, Plus } from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function ClubsIndex() {
    const { user } = useAuth();
    const [clubs, setClubs] = useState([]);
    const [myClubs, setMyClubs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [joiningId, setJoiningId] = useState(null);

    useEffect(() => {
        fetchClubs();
    }, []);

    const fetchClubs = async () => {
        setIsLoading(true);
        try {
            const data = await api.getClubs();
            setClubs(data);
            
            // Filtrer les clubs dont l'utilisateur est membre
            if (user) {
                const userClubs = data.filter(club => club.is_joined);
                setMyClubs(userClubs);
            }
        } catch (error) {
            console.error('Erreur chargement clubs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoin = async (clubId) => {
        setJoiningId(clubId);
        try {
            const result = await api.joinClub(clubId);
            if (result.success) {
                await fetchClubs();
            }
        } catch (error) {
            console.error('Erreur adhésion:', error);
        } finally {
            setJoiningId(null);
        }
    };

    const handleClubClick = (clubId) => {
        router.visit(`/clubs/${clubId}`);
    };

    const filteredClubs = clubs.filter(club =>
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (club.description && club.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const myFilteredClubs = myClubs.filter(club =>
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (club.description && club.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const otherClubs = filteredClubs.filter(club => !myClubs.some(mc => mc.id === club.id));

    if (isLoading) {
        return (
            <MobileLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
                </div>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout>
            <div className="px-6 py-4 pb-24">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Users className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Clubs de lecture</h2>
                                <p className="text-sm text-gray-600">
                                    {clubs.length} club{clubs.length > 1 ? 's' : ''} disponible{clubs.length > 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.visit("/clubs/create")}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-3 rounded-xl shadow-lg shadow-orange-500/30 transition-all"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Rechercher un club..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-noneocus:ring-2 focus:ring-orange-600 transition-all focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Mes clubs */}
                {myFilteredClubs.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Mes clubs</h3>
                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-semibold">
                                {myFilteredClubs.length}
                            </span>
                        </div>
                        <div className="space-y-3">
                            {myFilteredClubs.map((club) => (
                                <ClubCard
                                    key={club.id}
                                    club={club}
                                    onClick={() => handleClubClick(club.id)}
                                    isMember={true}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Découvrir */}
                {otherClubs.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Découvrir</h3>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                                {otherClubs.length}
                            </span>
                        </div>
                        <div className="space-y-3">
                            {otherClubs.map((club) => (
                                <ClubCard
                                    key={club.id}
                                    club={club}
                                    onClick={() => handleClubClick(club.id)}
                                    isMember={false}
                                    onJoin={() => handleJoin(club.id)}
                                    isJoining={joiningId === club.id}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {filteredClubs.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <Users className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">Aucun club trouvé</p>
                        <p className="text-gray-500 text-sm mt-1">Essayez une autre recherche</p>
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}

// Composant ClubCard
function ClubCard({ club, onClick, isMember, onJoin, isJoining }) {
    return (
        <div
            onClick={onClick}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-gray-200 hover:border-orange-300"
        >
            <div className="flex gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-lg text-gray-900 truncate">{club.name}</h3>
                        {isMember && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ml-2">
                                Membre
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {club.description || 'Aucune description'}
                    </p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-purple-500" />
                                <span className="font-medium">{club.members_count || 0} membres</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="truncate">Par {club.creator?.name || 'Inconnu'}</span>
                            </div>
                        </div>
                        {!isMember && onJoin && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onJoin();
                                }}
                                disabled={isJoining}
                                className="ml-4 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                            >
                                {isJoining ? '...' : 'Rejoindre'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}