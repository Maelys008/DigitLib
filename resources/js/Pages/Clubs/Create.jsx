import MobileLayout from "@/Layouts/MobileLayout";
import { useState } from "react";
import { ArrowLeft, Save, Loader2, Users, FileText, X } from "lucide-react";
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
        if (!formData.description.trim()) {
            setError("La description est requise");
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
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">Créer un club</h1>
                        </div>
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
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nom du club *
                            </label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ex: Les amoureux du Roman"
                                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                                    maxLength="255"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                {formData.name.length}/255 caractères
                            </p>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description *
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Décrivez votre club, les thèmes abordés, vos objectifs..."
                                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors resize-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Conseil */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                            <p className="text-sm text-blue-900">
                                💡 <strong>Conseil :</strong> Choisissez un nom accrocheur et une description claire pour attirer des membres !
                            </p>
                        </div>

                        {/* Boutons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => router.visit("/clubs")}
                                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
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