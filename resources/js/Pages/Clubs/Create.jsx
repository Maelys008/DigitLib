// resources/js/Pages/Clubs/Create.jsx
import MobileLayout from "@/Layouts/MobileLayout";
import { useState } from "react";
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from "lucide-react";
import { router } from "@inertiajs/react";
import api from "../../services/api";

export default function ClubsCreate() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError("Le nom du club est requis");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const response = await api.axios.post("/clubs", formData);
            if (response.data) {
                router.visit("/clubs");
            }
        } catch (err) {
            console.error("Erreur création club:", err);
            setError(err.response?.data?.message || "Erreur lors de la création");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MobileLayout>
            <div className="min-h-screen bg-gray-50">
                {/* En-tête */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.visit("/clubs")}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">
                            Créer un club
                        </h1>
                    </div>
                </div>

                {/* Formulaire */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Nom du club */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nom du club *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ex: Club Lecture Fantasy"
                                className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                maxLength="255"
                                required
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                {formData.name.length}/255 caractères
                            </p>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Décrivez l'objectif de votre club..."
                                className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                            />
                        </div>

                        {/* Information */}
                        {/* <div className="bg-purple-50 rounded-xl p-4">
                            <p className="text-sm text-purple-800">
                                💡 Une fois le club créé, vous en serez automatiquement le
                                créateur et pourrez :
                            </p>
                            <ul className="mt-2 text-sm text-purple-700 list-disc list-inside space-y-1">
                                <li>Inviter d'autres lecteurs</li>
                                <li>Animer les discussions</li>
                                <li>Gérer les membres</li>
                            </ul>
                        </div> */}

                        {/* Boutons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => router.visit("/clubs")}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Création...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Créer le club
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </MobileLayout>
    );
}