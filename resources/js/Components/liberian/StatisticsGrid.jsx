import { BookOpen, Users, Clock, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';

export default function StatisticsGrid({ stats }) {
  const statItems = [
    { 
      label: 'Total livres', 
      value: stats.totalCopies || 0,  
      icon: BookOpen, 
      bg: 'bg-blue-50', 
      iconColor: 'text-blue-600' 
    },
    { 
      label: 'Utilisateurs', 
      value: stats.users || 0, 
      icon: Users, 
      bg: 'bg-purple-50', 
      iconColor: 'text-purple-600' 
    },
    { 
      label: 'Disponibles', 
      value: stats.available || 0,  
      icon: BookOpen, 
      bg: 'bg-green-50', 
      iconColor: 'text-green-600' 
    },
    { 
      label: 'Empruntés', 
      value: stats.borrowed || 0, 
      icon: Calendar, 
      bg: 'bg-orange-50', 
      iconColor: 'text-orange-600' 
    },
    { 
      label: 'Réservations', 
      value: stats.reservations || 0, 
      icon: Clock, 
      bg: 'bg-blue-50', 
      iconColor: 'text-blue-600' 
    },
    { 
      label: 'Retards', 
      value: stats.lateReturns || 0, 
      icon: AlertTriangle, 
      bg: 'bg-red-50', 
      iconColor: 'text-red-600' 
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {statItems.map((item, index) => (
        <div key={index} className={`${item.bg} rounded-2xl p-4 shadow-sm`}>
          <div className="flex items-center justify-between mb-2">
            <item.icon className={`w-8 h-8 ${item.iconColor}`} />
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mb-1">{item.label}</p>
          <p className="text-2xl font-bold text-gray-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}