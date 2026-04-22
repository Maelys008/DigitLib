import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, User, Calendar, Loader2, CheckCircle, Library, Bell } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function LibraryRecordDetail() {
    const { props } = usePage();
    const { id } = props;
    const { user } = useAuth();
    const [record, setRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRecord();
    }, [id]);

    const fetchRecord = async () => {
        setIsLoading(true);
        try {
            const data = await api.getLibraryRecordDetail(id);
            setRecord(data);
        } catch (error) {
            console.error('Erreur chargement:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getSeverityInfo = (severity) => {
        const severities = {
            info: { label: 'Information', icon: 'ℹ️', color: 'bg-blue-100 text-blue-800' },
            warning: { label: 'Attention', icon: '⚠️', color: 'bg-yellow-100 text-yellow-800' },
            critical: { label: 'Critique', icon: '🔴', color: 'bg-orange-100 text-orange-800' },
            emergency: { label: 'Urgence', icon: '🚨', color: 'bg-red-100 text-red-800' },
        };
        return severities[severity] || severities.warning;
    };

    if (isLoading) {
        return (
            <MobileLayout>
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
            </MobileLayout>
        );
    }

    if (!record) {
        return (
            <MobileLayout>
                <div className="p-6 text-center">
                    <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Signalement non trouvé</p>
                </div>
            </MobileLayout>
        );
    }

    const severity = getSeverityInfo(record.severity);

    return (
        <MobileLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => router.visit('/librarian/library-records')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Détail du signalement</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">#{record.id}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 max-w-2xl mx-auto">
                    {/* Statut - AFFICHAGE SEULEMENT, PAS DE BOUTON */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${severity.color}`}>
                            {severity.icon} {severity.label}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            record.status === 'resolved' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-orange-100 text-orange-800'
                        }`}>
                            {record.status === 'resolved' ? '✅ Résolu' : '⏳ En attente'}
                        </span>
                        {/* 🔥 PAS DE BOUTON "Marquer comme résolu" ICI */}
                    </div>

                    {/* Titre */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{record.title}</h2>
                        {record.severity === 'emergency' && (
                            <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                <p className="text-red-600 dark:text-red-400 text-sm">🚨 URGENCE - Action immédiate requise</p>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            Description
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {record.description}
                        </p>
                    </div>

                    {/* Utilisateur concerné */}
                    {record.user && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <User className="w-5 h-5 text-purple-500" />
                                Utilisateur concerné
                            </h3>
                            <p className="font-medium text-gray-900 dark:text-white">{record.user.name}</p>
                            <p className="text-sm text-gray-500">{record.user.email}</p>
                        </div>
                    )}

                    {/* Bibliothèque */}
                    {record.library && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex-items-center gap-2">
                                <Library className="w-5 h-5 text-blue-500" />
                                Bibliothèque concernée
                            </h3>
                            <p className="font-medium text-gray-900 dark:text-white">{record.library.name}</p>
                        </div>
                    )}

                    {/* Signalé par */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-green-500" />
                            Informations
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">Signalé par :</span>
                                <span className="text-gray-900">{record.created_by_user?.name || 'Bibliothécaire'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">Date :</span>
                                <span className="text-gray-900">
                                    {new Date(record.date).toLocaleString('fr-FR')}
                                </span>
                            </div>
                            {record.resolved_at && (
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-gray-600">Résolu le :</span>
                                    <span className="text-gray-900">
                                        {new Date(record.resolved_at).toLocaleString('fr-FR')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}