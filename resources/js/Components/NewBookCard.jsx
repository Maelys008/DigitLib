import { Heart, Star } from "lucide-react";
import { router } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function NewBookCard({ livre, onClick, className = "" }) {
    // Initialiser l'état à partir de localStorage
    const [isLiked, setIsLiked] = useState(() => {
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        return favorites.some((fav) => fav.id === livre.id);
    });

    // Fonction pour obtenir l'URL correcte de l'image
    const getImageUrl = (imagePath) => {
        if (!imagePath) return "/placeholder-book.jpg";

        if (
            imagePath.startsWith("http://") ||
            imagePath.startsWith("https://")
        ) {
            return imagePath;
        }
        if (imagePath.startsWith("/storage/")) {
            return `http://localhost:8000${imagePath}`;
        }

        return `http://localhost:8000/storage/${imagePath}`;
    };

    // Mettre à jour localStorage quand isLiked change
    useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

        if (isLiked) {
            // Ajouter aux favoris si pas déjà présent
            if (!favorites.some((fav) => fav.id === livre.id)) {
                const newFavorites = [...favorites, livre];
                localStorage.setItem("favorites", JSON.stringify(newFavorites));
            }
        } else {
            // Retirer des favoris
            const newFavorites = favorites.filter((fav) => fav.id !== livre.id);
            localStorage.setItem("favorites", JSON.stringify(newFavorites));
        }
    }, [isLiked, livre]);

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            router.visit(`/book/${livre.id}`);
        }
    };

    const handleLikeClick = (e) => {
        e.stopPropagation();
        setIsLiked(!isLiked);
    };

    const imageUrl = getImageUrl(livre.image_couverture);

    return (
        <div
            onClick={handleClick}
            className={`
        flex gap-4 bg-[#F6F6F6] rounded-xl p-3
        shadow-sm hover:shadow-md transition-all cursor-pointer
        ${className}
      `}
        >
            <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                <img
                    src={imageUrl}
                    alt={livre.titre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = "/placeholder-book.jpg";
                    }}
                />
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-gray-900 text-base line-clamp-2 pr-2">
                        {livre.titre}
                    </h3>

                    <button
                        onClick={handleLikeClick}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                    >
                        <Heart
                            className={`w-5 h-5 transition-colors ${
                                isLiked
                                    ? "fill-[#1C1C1C] text-[#1C1C1C]"
                                    : "text-gray-400 hover:text-[#1C1C1C]"
                            }`}
                        />
                    </button>
                </div>

                <p className="text-sm text-gray-500 line-clamp-1 mb-2">
                    {livre.auteur}
                </p>

                <div className="flex justify-end mt-2">
                    {livre.note && (
                        <div className="flex items-center gap-1 bg-[#1C1C1C] text-white px-2 py-1 rounded-md">
                            <span className="text-xs font-medium">
                                {livre.note}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
