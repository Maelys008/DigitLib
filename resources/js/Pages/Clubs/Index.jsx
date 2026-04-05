// resources/js/Pages/Clubs/Index.jsx
import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../../services/api';

export default function ClubsIndex() {
      // const [club, setClub] = useState(null);
    const [clubs, setClubs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [joiningId, setJoiningId] = useState(null);

    useEffect(() => {
        fetchClubs();
    }, []);

    const fetchClubs = async () => {
        setIsLoading(true);
        try {
            const data = await api.getClubs();
            setClubs(data);
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
                await fetchClubs(); // Rafraîchir la liste
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

    if (isLoading) {
        return (
            <MobileLayout>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout>
            <div className="px-6 py-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Clubs de lecture
                </h1>
<div className="flex items-center justify-between mb-6">
    <h1 className="text-2xl font-bold text-gray-900">Clubs de lecture</h1>
    <button
        onClick={() => router.visit("/clubs/create")}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
    >
        + Créer un club
    </button>
</div>
                {clubs.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Aucun club disponible</p>
                        <p className="text-sm text-gray-400 mt-2">
                            Créez le premier club !
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {clubs.map((club) => (
                            <div
                                key={club.id}
                                onClick={() => handleClubClick(club.id)}
                                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 text-lg">
                                            {club.name}
                                        </h3>
                                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                                            {club.description || 'Aucune description'}
                                        </p>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {club.members_count || 0} membres
                                            </span>
                                            <span>
                                                Créé par {club.creator?.name || 'Inconnu'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleJoin(club.id);
                                        }}
                                        disabled={joiningId === club.id}
                                        className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            club.is_joined
                                                ? 'bg-gray-100 text-gray-600'
                                                : 'bg-purple-600 text-white hover:bg-purple-700'
                                        } disabled:opacity-50`}
                                    >
                                        {joiningId === club.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : club.is_joined ? (
                                            'Membre'
                                        ) : (
                                            'Rejoindre'
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}