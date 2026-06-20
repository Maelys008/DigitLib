import { Heart, Award, Settings, HelpCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import BadgeModal from '@/Components/ProfilDetails/BadgeModal';
import { useAuth } from '@/contexts/AuthContext';

export default function QuickActions() {
    const { user } = useAuth();
    const [showBadgeModal, setShowBadgeModal] = useState(false);

    const handleNavigation = (route) => {
        router.visit(route);
    };

    const actions = [
        { 
            label: 'Mes Favoris', 
            icon: Heart, 
            onClick: () => handleNavigation('/favorites'),
            color: 'text-red-500', 
            bgColor: 'bg-red-50 dark:bg-red-950/30',
            description: 'Vos livres coup de cœur'
        },
        { 
            label: 'Mon Badge', 
            icon: Award, 
            onClick: () => setShowBadgeModal(true),
            color: 'text-yellow-500', 
            bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
            description: 'Votre progression'
        },
        { 
            label: 'Paramètres', 
            icon: Settings, 
            onClick: () => handleNavigation('/profile/settings'),
            color: 'text-gray-500', 
            bgColor: 'bg-gray-50 dark:bg-gray-800',
            description: 'Gérer votre compte'
        },
        { 
            label: 'Support', 
            icon: HelpCircle, 
            onClick: () => handleNavigation('/profile/support'),
            color: 'text-blue-500', 
            bgColor: 'bg-blue-50 dark:bg-blue-950/30',
            description: 'Aide et assistance'
        },
    ];

    return (
        <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {actions.map((action, i) => {
                    const Icon = action.icon;
                    return (
                        <button 
                            key={i}
                            onClick={action.onClick}
                            className="group flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-900/50 transition-all duration-300"
                        >
                            <div className={`p-3 rounded-xl mb-3 ${action.bgColor} ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                {action.label}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 hidden sm:block">
                                {action.description}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Modal Badge */}
            <BadgeModal 
                isOpen={showBadgeModal}
                onClose={() => setShowBadgeModal(false)}
                user={{
                    ...user,
                    badge: user?.badge,
                    borrowedBooks: user?.total_loans || 0,
                    photo: null
                }}
            />
        </>
    );
}