// resources/js/Pages/Librarian/CreateIncident.jsx
import MobileLayout from '@/Layouts/MobileLayout';
import { useState  } from 'react';
import { ArrowLeft, AlertTriangle, Send, X } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';  // ← Ajoute usePage ici
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function CreateIncident() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        severity: 'warning',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const severityOptions = [
        { value: 'info', label: 'ℹ️ Information', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
        { value: 'warning', label: '⚠️ Attention', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
        { value: 'critical', label: '🔴 Critique', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
        { value: 'emergency', label: '🚨 Urgence', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    ];

   const { props: pageProps } = usePage();
const { incident_id } = pageProps; // Récupère l'ID de l'incident lié

// Modifie le handleSubmit pour lier l'incident
const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
        setError('Le titre est requis');
        return;
    }
    if (!formData.description.trim()) {
        setError('La description est requise');
        return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
        const result = await api.createIncident({
            title: formData.title,
            description: formData.description,
            severity: formData.severity,
            related_incident_id: incident_id || null, // Lie à l'incident existant
        });
        
        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                if (incident_id) {
                    router.visit(`/librarian/incidents/${incident_id}`);
                } else {
                    router.visit('/librarian/incidents');
                }
            }, 2000);
        } else {
            setError(result.message);
        }
    } catch (err) {
        setError('Erreur lors de la création de l\'incident');
    } finally {
        setIsSubmitting(false);
    }
};

    const getSeverityColor = (severity) => {
        const option = severityOptions.find(opt => opt.value === severity);
        return option?.color || severityOptions[1].color;
    };

    return (
        <MobileLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Signaler un incident</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Alerter tous les bibliothécaires
                            </p>
                        </div>
                    </div>
                </div>

                {/* Formulaire */}
                <div className="p-6 max-w-2xl mx-auto">
                    {success ? (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Incident signalé !</h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Tous les bibliothécaires ont été alertés.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Niveau de gravité */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Niveau de gravité *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {severityOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, severity: option.value })}
                                            className={`p-3 rounded-xl text-sm font-medium transition-all ${
                                                formData.severity === option.value
                                                    ? `${option.color} ring-2 ring-offset-2 ring-orange-500`
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Titre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Titre de l'incident *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: Comportement inapproprié, Livre endommagé, etc."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description détaillée *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={6}
                                    placeholder="Décrivez précisément l'incident..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>

                            {/* Aperçu de la notification */}
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📢 Aperçu de l'alerte :</p>
                                <div className={`p-3 rounded-lg ${getSeverityColor(formData.severity)}`}>
                                    <p className="font-semibold">{formData.title || 'Titre de l\'incident'}</p>
                                    <p className="text-sm mt-1">{formData.description || 'Description de l\'incident...'}</p>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Cette alerte sera envoyée à TOUS les bibliothécaires de l'application.
                                </p>
                            </div>

                            {/* Boutons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => router.visit('/librarian/incidents')}
                                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Envoi...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Signaler l'incident
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </MobileLayout>
    );
}