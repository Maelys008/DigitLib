import { useState, useRef } from 'react';
import { X, Camera, Upload } from 'lucide-react';

export default function CreatePartnerModal({ isOpen, onClose, onCreate, libraries }) {
    const [formData, setFormData] = useState({
        name: '',
        adress: '',
        description: '',
        parent_id: '',
        loan_duration: 14,
        daily_penalty_amount: 0,
        library_image: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, library_image: file }));
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const formDataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formDataToSend.append(key, value);
            }
        });
        
        await onCreate(formDataToSend);
        setIsSubmitting(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: '',
            adress: '',
            description: '',
            parent_id: '',
            loan_duration: 14,
            daily_penalty_amount: 0,
            library_image: null
        });
        setImagePreview(null);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50" onClick={onClose} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ajouter une bibliothèque partenaire</h2>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo / Image</label>
                            <div className="flex items-center gap-4">
                                <div 
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 transition-colors"
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                            </div>
                        </div>

                        {/* Nom */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                            />
                        </div>

                        {/* Adresse */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse *</label>
                            <input
                                type="text"
                                name="adress"
                                value={formData.adress}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                            />
                        </div>

                        {/* Bibliothèque parente */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bibliothèque principale *</label>
                            <select
                                name="parent_id"
                                value={formData.parent_id}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                            >
                                <option value="">Sélectionner une bibliothèque principale</option>
                                {libraries.filter(lib => lib.parent_id === null).map(lib => (
                                    <option key={lib.id} value={lib.id}>{lib.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">La bibliothèque partenaire sera rattachée à cette bibliothèque principale</p>
                        </div>

                        {/* Durée d'emprunt */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Durée d'emprunt (jours)</label>
                            <input
                                type="number"
                                name="loan_duration"
                                value={formData.loan_duration}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Pénalité */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pénalité par jour (FCFA)</label>
                            <input
                                type="number"
                                name="daily_penalty_amount"
                                value={formData.daily_penalty_amount}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !formData.name || !formData.adress}
                                className="flex-1 px-4 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Création...' : 'Créer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}