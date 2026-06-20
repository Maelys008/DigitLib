import { useState } from 'react';
import { X, Building2, Check } from 'lucide-react';

export default function CreateChildLibraryModal({ isOpen, onClose, onCreate, parentLibrary, availableLibraries }) {
    const [selectedLibraryId, setSelectedLibraryId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    // Filtrer les bibliothèques disponibles (exclure la bibliothèque actuelle)
    const libraries = availableLibraries?.filter(lib => lib.id !== parentLibrary?.id) || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedLibraryId) {
            setError('Veuillez sélectionner une bibliothèque');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // 🔥 Mettre à jour la bibliothèque sélectionnée avec le parent_id
            const formData = new FormData();
            formData.append('parent_id', parentLibrary?.id || '');
            
            await onCreate(selectedLibraryId, formData);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'ajout');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
                {/* En-tête */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Rattacher une bibliothèque fille
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                        <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Bibliothèque parente */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Bibliothèque parente
                        </label>
                        <div className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-orange-500" />
                                <span>{parentLibrary?.name || 'Aucune bibliothèque parente'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sélection de la bibliothèque fille */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sélectionner une bibliothèque fille *
                        </label>
                        {libraries.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-500 dark:text-gray-400">
                                <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                <p>Aucune bibliothèque disponible</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                    Créez d'abord une bibliothèque pour la rattacher
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {libraries.map((lib) => (
                                    <button
                                        key={lib.id}
                                        type="button"
                                        onClick={() => setSelectedLibraryId(lib.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                                            selectedLibraryId === lib.id
                                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Building2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                            <div className="text-left">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {lib.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {lib.adress || 'Adresse non renseignée'}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedLibraryId === lib.id && (
                                            <Check className="w-5 h-5 text-orange-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Boutons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-300"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !selectedLibraryId}
                            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Rattachement...' : 'Rattacher'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}