import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, User, BookOpen, Calendar, Loader2, CheckCircle, Send, Clock, Library } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function IncidentDetail() {
    const { props } = usePage();
    const { id } = props;
    const { user } = useAuth();
    const [incident, setIncident] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isResolving, setIsResolving] = useState(false);
    const [showResolveConfirm, setShowResolveConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasBeenReported, setHasBeenReported] = useState(false);

    useEffect(() => {
        fetchIncident();
    }, [id]);

    const fetchIncident = async () => {
        setIsLoading(true);
        try {
            const data = await api.getLibraryIncidents();
            const found = data.find(inc => inc.id === parseInt(id));
            setIncident(found);
        } catch (error) {
            console.error('Erreur chargement incident:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getSeverityInfo = (severity) => {
        const severities = {
            info: { label: 'Information', icon: 'ℹ️', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
            warning: { label: 'Attention', icon: '⚠️', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
            critical: { label: 'Critique', icon: '🔴', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
            emergency: { label: 'Urgence', icon: '🚨', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
        };
        return severities[severity] || severities.warning;
    };

    const getStatusInfo = (status) => {
        const statuses = {
            pending: { label: 'En attente', icon: '⏳', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
            resolved: { label: 'Résolu', icon: '✅', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
            dismissed: { label: 'Ignoré', icon: '❌', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
        };
        return statuses[status] || statuses.pending;
    };

    const handleResolve = async () => {
        setIsResolving(true);
        try {
            const result = await api.resolveIncident(incident.id);
            if (result.success) {
                await fetchIncident();
                setShowResolveConfirm(false);
                router.visit('/librarian/incidents');
            }
        } catch (error) {
            console.error('Erreur résolution:', error);
            alert('Erreur lors de la résolution');
        } finally {
            setIsResolving(false);
        }
    };

    const severityInfo = incident ? getSeverityInfo(incident.severity) : null;
    const statusInfo = incident ? getStatusInfo(incident.status) : null;

    if (isLoading) {
        return (
            <MobileLayout>
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="w-8 h-8 text-orange-500 dark:text-orange-400 animate-spin" />
                </div>
            </MobileLayout>
        );
    }

    if (!incident) {
        return (
            <MobileLayout>
                <div className="px-6 py-4 text-center">
                    <AlertTriangle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Incident non trouvé</p>
                    <button
                        onClick={() => router.visit('/librarian/incidents')}
                        className="mt-4 text-orange-600 dark:text-orange-400 font-medium"
                    >
                        Retour aux incidents
                    </button>
                </div>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => router.visit('/librarian/incidents')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Détail de l'incident</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                #{incident.id}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contenu */}
                <div className="p-6 max-w-2xl mx-auto">
                    {/* En-tête avec statut et gravité */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${severityInfo.color}`}>
                            {severityInfo.icon} {severityInfo.label}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                            {statusInfo.icon} {statusInfo.label}
                        </span>
                        {incident.status === 'pending' && (
                            <button
                                onClick={() => setShowResolveConfirm(true)}
                                className="ml-auto px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Marquer comme résolu
                            </button>
                        )}
                    </div>

                    {/* Titre */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{incident.title}</h2>
                        {incident.severity === 'emergency' && (
                            <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center gap-2">
                                <span className="text-red-600 dark:text-red-400 text-sm">🚨 URGENCE - Une action immédiate est requise</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            Description
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {incident.description}
                        </p>
                    </div>

                    {/* Section pour signaler un incident grave */}
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 mb-6 border border-red-200 dark:border-red-800">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">Signaler un incident grave</h3>
                                <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                                    Si cet incident est grave et nécessite l'attention de tous les bibliothécaires, vous pouvez le signaler.
                                    Une notification sera envoyée à TOUS les bibliothécaires de l'application.
                                </p>

                                <button
                                    onClick={async () => {
                                        if (hasBeenReported) {
                                            alert('Ce signalement a déjà été envoyé !');
                                            return;
                                        }
                                        
                                        if (confirm('Confirmer le signalement de cet incident ? Tous les bibliothécaires seront alertés.')) {
                                            setIsSubmitting(true);
                                            try {
                                                // 🔥 CORRECTION ICI : Récupère le library_id correctement
                                                const libraryId = incident.library_id || incident.library?.id;
                                                
                                                console.log('📤 Envoi du signalement...', {
                                                    title: `Incident grave: ${incident.title || 'Signalement'}`,
                                                    description: incident.description,
                                                    severity: incident.severity || 'critical',
                                                    related_incident_id: incident.id,
                                                    user_id: incident.user?.id,
                                                    library_id: libraryId,
                                                });
                                                
                                           const result = await api.createLibraryRecord({
                                                    title: `Incident grave: ${incident.title || 'Signalement'}`,
                                                    description: incident.description,
                                                    severity: incident.severity || 'critical',
                                                    related_incident_id: incident.id,
                                                    user_id: incident.user?.id,
                                                    library_id: libraryId,  
                                                });
                                                                                                
                                                if (result.success) {
                                                    setHasBeenReported(true);
                                                    alert('Incident signalé à tous les bibliothécaires !');
                                                    router.visit('/librarian/library-records');
                                                } else {
                                                    alert('Erreur: ' + result.message);
                                                }
                                            } catch (error) {
                                                console.error('❌ Erreur:', error);
                                                alert('Erreur lors du signalement');
                                            } finally {
                                                setIsSubmitting(false);
                                            }
                                        }
                                    }}
                                    disabled={isSubmitting || hasBeenReported}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : hasBeenReported ? (
                                        '✓ Déjà signalé'
                                    ) : (
                                        <AlertTriangle className="w-4 h-4" />
                                    )}
                                    Signaler cet incident à tous
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Informations sur le livre et l'utilisateur */}
                    {incident.loan && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-500" />
                                Livre concerné
                            </h3>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Titre</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{incident.loan?.copy?.book?.title || 'N/A'}</p>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Auteur</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{incident.loan?.copy?.book?.author || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {incident.user && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <User className="w-5 h-5 text-purple-500" />
                                Utilisateur concerné
                            </h3>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Nom</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{incident.user?.name || 'N/A'}</p>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{incident.user?.email || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Date de signalement */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-green-500" />
                            Informations temporelles
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">Signalé le :</span>
                                <span className="text-gray-900 dark:text-white">
                                    {new Date(incident.date).toLocaleDateString('fr-FR', {
                                        day: 'numeric', month: 'long', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            {incident.resolved_at && (
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-gray-600 dark:text-gray-400">Résolu le :</span>
                                    <span className="text-gray-900 dark:text-white">
                                        {new Date(incident.resolved_at).toLocaleDateString('fr-FR', {
                                            day: 'numeric', month: 'long', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            )}
                            {incident.resolved_by && (
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-400">Résolu par :</span>
                                    <span className="text-gray-900 dark:text-white">{incident.resolver?.name || 'N/A'}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bibliothèque concernée */}
                    {incident.library && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Library className="w-5 h-5 text-purple-500" />
                                Bibliothèque concernée
                            </h3>
                            <p className="font-medium text-gray-900 dark:text-white">{incident.library.name}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de confirmation de résolution - CENTRÉ AU MILIEU */}
            {showResolveConfirm && (
                <div className="fixed inset-0 flex items-center justify-center z-[9999]">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setShowResolveConfirm(false)} />
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl w-[90%] max-w-md p-6 shadow-2xl">
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirmer la résolution</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Êtes-vous sûr de vouloir marquer cet incident comme résolu ?
                            </p>
                            <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {incident.title}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowResolveConfirm(false)}
                                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleResolve}
                                disabled={isResolving}
                                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                            >
                                {isResolving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Traitement...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Confirmer
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MobileLayout>
    );
}