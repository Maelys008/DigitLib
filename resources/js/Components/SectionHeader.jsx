import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

export default function SectionHeader({ 
    titre, 
    voirToutLien = '#', 
    voirToutTexte = 'Voir tout',
    className = '' 
}) {
    return (
        <div className={`flex items-end justify-between mb-4 ${className}`}>
            <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {titre}
                </h2>
                {/* Barre décorative orange - plus fine sur mobile */}
                <div className="h-0.5 w-10 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full"></div>
            </div>

            <Link 
                href={voirToutLien}
                className="group flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 transition-all"
            >
                <span>{voirToutTexte}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
        </div>
    );
}