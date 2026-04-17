import { Plus, UserCog, AlertTriangle, FileText, Settings, BookOpen, Users, DollarSign } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function ActionButtons({ 
  onManageBooks, 
  onManageUsers, 
  onViewIncidents, 
  onViewReports, 
  onBorrowingRules, 
  onPartnerLibraries,
  onManageInternalMembers,
  onManagePenalties,
  onViewCasier
}) {
  const actions = [
    { 
      label: 'Gestion des livres', 
      icon: BookOpen, 
      onClick: onManageBooks, 
      gradient: 'from-cyan-500 to-blue-600', 
      textWhite: true 
    },
    { 
      label: 'Membres internes',   
      icon: Users, 
      onClick: onManageInternalMembers, 
      gradient: 'from-purple-500 to-pink-500', 
      textWhite: true 
    },
    { 
      label: 'Gérer utilisateurs', 
      icon: UserCog, 
      onClick: onManageUsers, 
      bg: 'bg-white dark:bg-gray-800', 
      textColor: 'text-purple-600 dark:text-purple-400', 
      border: true 
    },
    { 
      label: 'Pénalités', 
      icon: DollarSign, 
      onClick: onManagePenalties, 
      bg: 'bg-white dark:bg-gray-800', 
      textColor: 'text-red-600 dark:text-red-400', 
      border: true 
    },
    { 
      label: 'Voir incidents', 
      icon: AlertTriangle, 
      onClick: onViewIncidents, 
      bg: 'bg-white dark:bg-gray-800', 
      textColor: 'text-red-600 dark:text-red-400', 
      border: true 
    },
    { 
      label: 'Rapports', 
      icon: FileText, 
      onClick: onViewReports, 
      bg: 'bg-white dark:bg-gray-800', 
      textColor: 'text-blue-600 dark:text-blue-400', 
      border: true 
    },
    { 
      label: 'Règles d\'emprunt', 
      icon: Settings, 
      onClick: onBorrowingRules, 
      bg: 'bg-white dark:bg-gray-800', 
      textColor: 'text-gray-600 dark:text-gray-400', 
      border: true 
    },
    { 
      label: 'Bibliothèques partenaires', 
      icon: BookOpen, 
      onClick: onPartnerLibraries, 
      bg: 'bg-white dark:bg-gray-800', 
      textColor: 'text-green-600 dark:text-green-400', 
      border: true 
    },
    {
  label: 'Casier bibliothécaire',
  icon: AlertTriangle,
  onClick: onViewCasier,
  bg: 'bg-white dark:bg-gray-800',
  textColor: 'text-orange-600 dark:text-orange-400',
  border: true
}
  ];

  return (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Actions rapides :</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`
              ${action.gradient 
                ? `bg-gradient-to-r ${action.gradient} text-white shadow-lg` 
                : `${action.bg} border-2 border-gray-200 dark:border-gray-700`
              }
              p-4 rounded-xl font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-2
            `}
          >
            <action.icon className={`w-5 h-5 ${action.textColor || 'text-white'}`} />
            <span className={action.textColor || 'text-white'}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}