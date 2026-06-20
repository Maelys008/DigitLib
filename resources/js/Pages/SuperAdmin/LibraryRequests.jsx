import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { useState, useEffect } from 'react';
import {
    ClipboardList, CheckCircle, XCircle, Loader2,
    ChevronLeft, ChevronRight, Building2, User,
    MapPin, Calendar, Mail, AlertCircle, Eye,
    X, Check, ThumbsUp, ThumbsDown, Clock
} from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../../services/api';

export default function LibraryRequests() {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
    });
    const [actionLoading, setActionLoading] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [message, setMessage] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successRequest, setSuccessRequest] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });

    useEffect(() => {
        fetchRequests();
        fetchStats();
    }, [pagination.current_page]);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const data = await api.getSuperAdminLibraryRequests({
                page: pagination.current_page,
                per_page: pagination.per_page
            });
            setRequests(data.data || []);
            setPagination({
                current_page: data.current_page || 1,
                last_page: data.last_page || 1,
                per_page: data.per_page || 10,
                total: data.total || 0
            });
        } catch (error) {
            console.error('Erreur chargement demandes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const statsData = await api.getSuperAdminStats();
            setStats({
                total: statsData.total_libraries || 0,
                pending: statsData.pending_libraries || 0,
                approved: statsData.approved_libraries || 0,
                rejected: statsData.rejected_libraries || 0
            });
        } catch (error) {
            console.error('Erreur chargement stats:', error);
        }
    };

    const handleApprove = async (request) => {
        setActionLoading(request.id);
        try {
            const result = await api.approveLibraryRequest(request.id);
            if (result.success) {
                setSuccessRequest(request);
                setShowSuccessModal(true);
                await fetchRequests();
                await fetchStats();
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de l\'approbation' });
        } finally {
            setActionLoading(null);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    const openRejectModal = (request) => {
        setSelectedRequest(request);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const handleReject = async () => {
        if (!selectedRequest) return;
        if (!rejectReason.trim()) {
            setMessage({ type: 'error', text: 'Veuillez indiquer une raison pour le rejet' });
            return;
        }

        setActionLoading(selectedRequest.id);
        setShowRejectModal(false);

        try {
            const result = await api.rejectLibraryRequest(selectedRequest.id, rejectReason);
            if (result.success) {
                setMessage({ type: 'success', text: `Demande de "${selectedRequest.name}" rejetée.` });
                await fetchRequests();
                await fetchStats();
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors du rejet' });
        } finally {
            setActionLoading(null);
            setSelectedRequest(null);
            setRejectReason('');
            setTimeout(() => setMessage(null), 5000);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.last_page) {
            setPagination(prev => ({ ...prev, current_page: page }));
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Date inconnue';
        return new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <SuperAdminLayout>
            {/* En-tête */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    Demandes de bibliothèques
                </h1>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
                    Gérez les demandes de création de bibliothèques
                </p>
            </div>

            {/* Message de notification */}
            {message && (
                <div className={`mb-4 p-4 rounded-xl flex items-center justify-between ${
                    message.type === 'success' 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                    <div className="flex items-center gap-3">
                        {message.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                        <span className={message.type === 'success' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}>
                            {message.text}
                        </span>
                    </div>
                    <button onClick={() => setMessage(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                        <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>
            )}

            {/* Statistiques rapides avec les vraies données */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total demandes</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                            <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">En attente</p>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pending}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/30">
                            <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Déjà approuvées</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/30">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste des demandes */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-12 h-12 text-green-500 dark:text-green-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Aucune demande en attente</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                            Toutes les demandes de création de bibliothèques ont été traitées.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {requests.map((request) => {
                            const isPending = request.status === 'pending';
                            const isApproved = request.status === 'approved';
                            const isRejected = request.status === 'rejected';

                            return (
                                <div key={request.id} className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                                    isPending ? 'border-l-4 border-l-orange-400 dark:border-l-orange-600' : ''
                                }`}>
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                        {request.name}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                        <div className="flex items-center gap-1">
                                                            <User className="w-4 h-4" />
                                                            <span>Demandé par {request.administrator?.name || 'Inconnu'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{formatDate(request.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 space-y-1">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                                    <span>{request.adress}</span>
                                                </p>
                                                {request.description && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-2">
                                                        <span className="text-gray-400 flex-shrink-0">📝</span>
                                                        <span className="line-clamp-2">{request.description}</span>
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {request.administrator?.email || 'Email non disponible'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col items-end gap-3 min-w-[140px]">
                                            {/* Statut */}
                                            <div className="flex items-center gap-2">
                                                {isPending && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                        ⏳ En attente
                                                    </span>
                                                )}
                                                {isApproved && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                        ✅ Approuvée
                                                    </span>
                                                )}
                                                {isRejected && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                        ❌ Rejetée
                                                    </span>
                                                )}
                                            </div>

                                            {/* Boutons d'action */}
                                            {isPending && (
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() => handleApprove(request)}
                                                        disabled={actionLoading === request.id}
                                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        {actionLoading === request.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Check className="w-4 h-4" />
                                                        )}
                                                        Approuver
                                                    </button>
                                                    <button
                                                        onClick={() => openRejectModal(request)}
                                                        disabled={actionLoading === request.id}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Rejeter
                                                    </button>
                                                </div>
                                            )}
                                            {isApproved && (
                                                <button
                                                    onClick={() => router.visit(`/libraries/${request.id}`)}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Voir la bibliothèque
                                                </button>
                                            )}
                                            {isRejected && (
                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                    Rejetée le {formatDate(request.updated_at)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {pagination.total} demande{pagination.total > 1 ? 's' : ''}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Page {pagination.current_page} / {pagination.last_page}
                            </span>
                            <button
                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de rejet */}
            {showRejectModal && selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Rejeter la demande
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">
                                Vous êtes sur le point de rejeter la bibliothèque <strong>"{selectedRequest.name}"</strong>
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                L'administrateur recevra une notification avec la raison.
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Raison du rejet *
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Expliquez pourquoi cette demande est rejetée..."
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none h-24"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSelectedRequest(null);
                                    setRejectReason('');
                                }}
                                className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-300"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                            >
                                Confirmer le rejet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de succès - Approbation */}
            {showSuccessModal && successRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Bibliothèque approuvée !
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">
                                La bibliothèque <strong>"{successRequest.name}"</strong> a été approuvée avec succès.
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                L'administrateur a été notifié par email.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    setSuccessRequest(null);
                                }}
                                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-medium transition-colors"
                            >
                                Fermer
                            </button>
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    setSuccessRequest(null);
                                    router.visit(`/libraries/${successRequest.id}`);
                                }}
                                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
                            >
                                Voir la bibliothèque
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}