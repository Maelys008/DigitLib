import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { useState, useEffect } from 'react';
import { 
    Users, Library, Clock, ShieldCheck, TrendingUp, 
    ArrowRight, CheckCircle, XCircle, Loader2, AlertCircle
} from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../../services/api';

export default function Dashboard() {
    const [stats, setStats] = useState({
        total_users: 0,
        total_libraries: 0,
        pending_libraries: 0,
        approved_libraries: 0,
        rejected_libraries: 0,
        super_admins: 0
    });
    const [recentRequests, setRecentRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            // Récupérer les stats
            const statsData = await api.getSuperAdminStats();
            setStats(statsData);

            // Récupérer les dernières demandes
            const requestsData = await api.getSuperAdminLibraryRequests({ per_page: 5 });
            setRecentRequests(requestsData.data || []);
        } catch (error) {
            console.error('Erreur chargement dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const statCards = [
        { 
            id: 'total_users', 
            label: 'Total utilisateurs', 
            value: stats.total_users, 
            icon: Users, 
            color: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-50 dark:bg-blue-900/30',
            textColor: 'text-blue-600 dark:text-blue-400'
        },
        { 
            id: 'total_libraries', 
            label: 'Bibliothèques', 
            value: stats.total_libraries, 
            icon: Library, 
            color: 'from-green-500 to-green-600',
            bgLight: 'bg-green-50 dark:bg-green-900/30',
            textColor: 'text-green-600 dark:text-green-400'
        },
        { 
            id: 'pending_libraries', 
            label: 'Demandes en attente', 
            value: stats.pending_libraries, 
            icon: Clock, 
            color: 'from-orange-500 to-orange-600',
            bgLight: 'bg-orange-50 dark:bg-orange-900/30',
            textColor: 'text-orange-600 dark:text-orange-400'
        },
        { 
            id: 'super_admins', 
            label: 'Super Admins', 
            value: stats.super_admins, 
            icon: ShieldCheck, 
            color: 'from-purple-500 to-purple-600',
            bgLight: 'bg-purple-50 dark:bg-purple-900/30',
            textColor: 'text-purple-600 dark:text-purple-400'
        },
    ];

    if (isLoading) {
        return (
            <SuperAdminLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
            </SuperAdminLayout>
        );
    }

    return (
        <SuperAdminLayout>
            {/* En-tête */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    Tableau de bord
                </h1>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
                    Gérez la plateforme DigiLib en un coup d'œil
                </p>
            </div>

            {/* 🔥 ALERTE : Demandes en attente */}
            {stats.pending_libraries > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-yellow-800 dark:text-yellow-400">
                                {stats.pending_libraries} demande{stats.pending_libraries > 1 ? 's' : ''} de bibliothèque en attente
                            </p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                Consultez la section "Demandes" pour les approuver ou les rejeter.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.visit('/super-admin/library-requests')}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                    >
                        Voir les demandes
                    </button>
                </div>
            )}

            {/* Statistiques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    const isPending = card.id === 'pending_libraries';
                    return (
                        <div
                            key={card.id}
                            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border ${
                                isPending && stats.pending_libraries > 0
                                    ? 'border-yellow-300 dark:border-yellow-700 ring-1 ring-yellow-400 dark:ring-yellow-600'
                                    : 'border-gray-100 dark:border-gray-700'
                            } hover:shadow-md transition-all`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                                    <p className={`text-2xl font-bold mt-1 ${
                                        isPending && stats.pending_libraries > 0
                                            ? 'text-yellow-600 dark:text-yellow-400'
                                            : 'text-gray-900 dark:text-white'
                                    }`}>
                                        {card.value}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-xl ${card.bgLight}`}>
                                    <Icon className={`w-6 h-6 ${card.textColor}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Demandes récentes */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        📋 Demandes récentes
                    </h2>
                    {recentRequests.length > 0 && (
                        <button
                            onClick={() => router.visit('/super-admin/library-requests')}
                            className="text-sm text-orange-600 dark:text-orange-400 font-medium hover:underline flex items-center gap-1"
                        >
                            Voir toutes <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {recentRequests.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <CheckCircle className="w-16 h-16 text-green-300 dark:text-green-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                                Aucune demande en attente
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                Toutes les demandes de bibliothèque ont été traitées.
                            </p>
                        </div>
                    ) : (
                        recentRequests.map((request) => (
                            <div key={request.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {request.name}
                                            </h3>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                En attente
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Demandé par {request.administrator?.name || 'Inconnu'} • {request.adress}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            📅 {new Date(request.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => router.visit('/super-admin/library-requests')}
                                        className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                                    >
                                        Traiter
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Actions rapides */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <button
                    onClick={() => router.visit('/super-admin/users')}
                    className="flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-orange-200 transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Gérer les utilisateurs</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Voir et gérer les Super Admins</p>
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                </button>

                <button
                    onClick={() => router.visit('/super-admin/library-requests')}
                    className={`flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-2xl border ${
                        stats.pending_libraries > 0
                            ? 'border-yellow-300 dark:border-yellow-700 ring-1 ring-yellow-400 dark:ring-yellow-600'
                            : 'border-gray-100 dark:border-gray-700'
                    } hover:shadow-md hover:border-orange-200 transition-all`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${
                            stats.pending_libraries > 0
                                ? 'bg-yellow-100 dark:bg-yellow-900/30'
                                : 'bg-orange-50 dark:bg-orange-900/30'
                        }`}>
                            <Library className={`w-6 h-6 ${
                                stats.pending_libraries > 0
                                    ? 'text-yellow-600 dark:text-yellow-400'
                                    : 'text-orange-600 dark:text-orange-400'
                            }`} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Demandes de bibliothèques</h3>
                            <p className={`text-sm ${
                                stats.pending_libraries > 0
                                    ? 'text-yellow-600 dark:text-yellow-400 font-medium'
                                    : 'text-gray-500 dark:text-gray-400'
                            }`}>
                                {stats.pending_libraries > 0 
                                    ? `${stats.pending_libraries} demande${stats.pending_libraries > 1 ? 's' : ''} en attente`
                                    : 'Aucune demande en attente'
                                }
                            </p>
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                </button>
            </div>
        </SuperAdminLayout>
    );
}