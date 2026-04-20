import { X, Download, Calendar, TrendingUp, Users, BookOpen, BarChart3, FileText, PieChart, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ReportsModal({ isOpen, onClose, libraryId, isAdmin }) {
    const [selectedReport, setSelectedReport] = useState('overview');
    const [dateRange, setDateRange] = useState('month');
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [topBooks, setTopBooks] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [genreDistribution, setGenreDistribution] = useState([]);
    const [activePenalties, setActivePenalties] = useState([]);

    useEffect(() => {
        if (isOpen && libraryId && isAdmin) {
            fetchAllData();
        } else if (isOpen && !isAdmin) {
            setIsLoading(false);
        }
    }, [isOpen, libraryId, dateRange, isAdmin]);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [statsData, topBooksData, topUsersData, genreData, penaltiesData] = await Promise.all([
                api.getReportsStats(libraryId, dateRange),
                api.getTopBooks(libraryId, 5),
                api.getTopUsers(libraryId, 5),
                api.getGenreDistribution(libraryId),
                api.getActivePenalties(libraryId)
            ]);
            
            setStats(statsData);
            setTopBooks(topBooksData);
            setTopUsers(topUsersData);
            setGenreDistribution(genreData);
            setActivePenalties(penaltiesData);
        } catch (error) {
            console.error('Erreur chargement rapports:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    // 🔥 Si l'utilisateur n'est pas admin, afficher le message d'erreur directement
    if (!isAdmin) {
        return (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 mb-4">
                            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Accès non autorisé</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-center">
                            Les rapports sont réservés aux administrateurs de la bibliothèque.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-6 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors w-full"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Reste du code pour les admins (inchangé)
    const reportTypes = [
        { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3, color: 'orange' },
        { id: 'borrowings', label: 'Emprunts', icon: BookOpen, color: 'blue' },
        { id: 'users', label: 'Utilisateurs', icon: Users, color: 'purple' },
        { id: 'inventory', label: 'Inventaire', icon: PieChart, color: 'green' },
        { id: 'penalties', label: 'Pénalités', icon: FileText, color: 'red' },
    ];

    const renderReportContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 text-orange-500 dark:text-orange-400 animate-spin" />
                </div>
            );
        }

        switch (selectedReport) {
            case 'overview':
                return (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 p-4 rounded-xl">
                            <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">Statistiques générales</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Total livres</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalBooks || 0}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Total exemplaires</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalCopies || 0}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Utilisateurs actifs</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.users || 0}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Emprunts en cours</p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.borrowed || 0}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Réservations</p>
                                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.reservations || 0}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Retards</p>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats?.lateReturns || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 p-4 rounded-xl">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Taux d'utilisation</h4>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700 dark:text-gray-300">Livres empruntés</span>
                                        <span className="font-semibold text-blue-900 dark:text-blue-300">
                                            {stats?.totalBooks ? Math.round((stats?.borrowed / stats?.totalBooks) * 100) : 0}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full" style={{ width: `${stats?.totalBooks ? (stats?.borrowed / stats?.totalBooks) * 100 : 0}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700 dark:text-gray-300">Livres disponibles</span>
                                        <span className="font-semibold text-green-900 dark:text-green-300">
                                            {stats?.totalBooks ? Math.round((stats?.available / stats?.totalBooks) * 100) : 0}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-600 dark:bg-green-500 rounded-full" style={{ width: `${stats?.totalBooks ? (stats?.available / stats?.totalBooks) * 100 : 0}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {stats?.lateReturns > 0 && (
                            <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 p-4 rounded-xl">
                                <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">⚠ Alertes</h4>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    {stats.lateReturns} retour{stats.lateReturns > 1 ? 's' : ''} en retard nécessite{stats.lateReturns > 1 ? 'nt' : ''} votre attention
                                </p>
                            </div>
                        )}
                    </div>
                );

            case 'borrowings':
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Rapport des emprunts</h4>
                            <div className="space-y-3">
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Emprunts actifs</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">{stats?.borrowed || 0}</p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-green-500 dark:text-green-400" />
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Réservations en attente</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">{stats?.reservations || 0}</p>
                                    </div>
                                    <Calendar className="w-8 h-8 text-orange-500 dark:text-orange-400" />
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Livres les plus empruntés</p>
                                    <div className="space-y-2">
                                        {topBooks.map((book, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span className="text-gray-700 dark:text-gray-300">{book.title} - {book.author}</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">{book.total} fois</span>
                                            </div>
                                        ))}
                                        {topBooks.length === 0 && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'users':
                return (
                    <div className="space-y-4">
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">Rapport utilisateurs</h4>
                            <div className="space-y-3">
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total utilisateurs</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.users || 0}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Utilisateurs les plus actifs</p>
                                    <div className="space-y-2">
                                        {topUsers.map((user, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span className="text-gray-700 dark:text-gray-300">{user.name}</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">{user.total} emprunts</span>
                                            </div>
                                        ))}
                                        {topUsers.length === 0 && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'inventory':
                return (
                    <div className="space-y-4">
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">Rapport d'inventaire</h4>
                            <div className="space-y-3">
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">État des livres</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-700 dark:text-green-400">✓ Disponibles</span>
                                            <span className="font-semibold text-green-900 dark:text-green-300">{stats?.available || 0}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-blue-700 dark:text-blue-400">📖 Empruntés</span>
                                            <span className="font-semibold text-blue-900 dark:text-blue-300">{stats?.borrowed || 0}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-orange-700 dark:text-orange-400">🔖 Réservés</span>
                                            <span className="font-semibold text-orange-900 dark:text-orange-300">{stats?.reservations || 0}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Répartition par genre</p>
                                    <div className="space-y-2">
                                        {genreDistribution.map((genre, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span className="text-gray-700 dark:text-gray-300">{genre.name}</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">{genre.total} livres</span>
                                            </div>
                                        ))}
                                        {genreDistribution.length === 0 && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'penalties':
                return (
                    <div className="space-y-4">
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                            <h4 className="font-semibold text-red-900 dark:text-red-100 mb-3">Rapport des pénalités</h4>
                            <div className="space-y-3">
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Retours en retard</p>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats?.lateReturns || 0}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pénalités actives</p>
                                    <div className="space-y-2">
                                        {activePenalties.map((penalty, index) => (
                                            <div key={index} className="flex justify-between items-center text-sm">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{penalty.user_name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{penalty.book_title}</p>
                                                </div>
                                                <span className="font-semibold text-red-600 dark:text-red-400">{penalty.amount} FCFA</span>
                                            </div>
                                        ))}
                                        {activePenalties.length === 0 && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Aucune pénalité active</p>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total pénalités</p>
                                        <p className="text-xl font-bold text-red-900 dark:text-red-300">{stats?.totalPenalties || 0} FCFA</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-500 p-2 rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Rapports de bibliothèque</h2>
                                <p className="text-sm text-gray-300">Analyses et statistiques détaillées</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-xl transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Date Range Selector */}
                    <div className="flex gap-2">
                        {['week', 'month', 'year'].map((period) => (
                            <button
                                key={period}
                                onClick={() => setDateRange(period)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    dateRange === period
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                {period === 'week' ? 'Cette semaine' : period === 'month' ? 'Ce mois' : 'Cette année'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Report Type Tabs */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <div className="flex gap-2">
                        {reportTypes.map((report) => {
                            const Icon = report.icon;
                            return (
                                <button
                                    key={report.id}
                                    onClick={() => setSelectedReport(report.id)}
                                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-2 transition-all ${
                                        selectedReport === report.id
                                            ? `bg-${report.color}-500 text-white shadow-md`
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {report.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Report Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
                    {renderReportContent()}

                    {/* Export Button */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2">
                            <Download className="w-5 h-5" />
                            Exporter en PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}