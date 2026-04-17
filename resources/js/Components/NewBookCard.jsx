import { Heart, Star } from "lucide-react";
import { router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function NewBookCard({ livre, onClick, className = "" }) {
    const { user, isAuthenticated } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return "/placeholder-book.jpg";
        if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
            return imagePath;
        }
        if (imagePath.startsWith("/storage/")) {
            return `http://localhost:8000${imagePath}`;
        }
        return `http://localhost:8000/storage/${imagePath}`;
    };

    useEffect(() => {
        const checkFavorite = async () => {
            if (!isAuthenticated) {
                const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
                setIsLiked(favorites.some((fav) => fav.id === livre.id));
                return;
            }
            
            try {
                const result = await api.isFavorite(livre.id);
                setIsLiked(result.is_favorite);
            } catch (error) {
                console.error('Erreur vérification favori:', error);
                const favorites = JSON.parse(localStorage.getItem(`favorites_${user?.id}`) || "[]");
                setIsLiked(favorites.some((fav) => fav.id === livre.id));
            }
        };
        
        checkFavorite();
    }, [livre.id, isAuthenticated, user?.id]);

    const handleLikeClick = async (e) => {
        e.stopPropagation();
        if (isToggling) return;
        
        setIsToggling(true);
        
        if (!isAuthenticated) {
            const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
            if (isLiked) {
                const newFavorites = favorites.filter((fav) => fav.id !== livre.id);
                localStorage.setItem("favorites", JSON.stringify(newFavorites));
                setIsLiked(false);
            } else {
                const newFavorites = [...favorites, livre];
                localStorage.setItem("favorites", JSON.stringify(newFavorites));
                setIsLiked(true);
            }
            setIsToggling(false);
            return;
        }
        
        try {
            const result = await api.toggleFavorite(livre.id);
            if (result.success) {
                setIsLiked(result.data.favorited);
            }
        } catch (error) {
            console.error('Erreur favori:', error);
        } finally {
            setIsToggling(false);
        }
    };

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            router.visit(`/book/${livre.id}`);
        }
    };

    const imageUrl = getImageUrl(livre.image_couverture);

    return (
        <div
            onClick={handleClick}
            className={`
                flex gap-4 bg-[#F6F6F6] dark:bg-gray-800 rounded-xl p-3
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
                    <h3 className="font-bold text-gray-900 dark:text-white text-base line-clamp-2 pr-2">
                        {livre.titre}
                    </h3>

                    <button
                        onClick={handleLikeClick}
                        disabled={isToggling}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
                    >
                        <Heart
                            className={`w-5 h-5 transition-colors ${
                                isLiked
                                    ? "fill-[#1C1C1C] dark:fill-white text-[#1C1C1C] dark:text-white"
                                    : "text-gray-400 dark:text-gray-500 hover:text-[#1C1C1C] dark:hover:text-white"
                            }`}
                        />
                    </button>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
                    {livre.auteur}
                </p>

                <div className="flex justify-end mt-2">
                    {livre.note !== undefined && livre.note !== null && (
                        <div className="flex items-center gap-1 bg-[#1C1C1C] dark:bg-gray-700 text-white px-2 py-1 rounded-md">
                            <span className="text-xs font-medium">{livre.note}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}