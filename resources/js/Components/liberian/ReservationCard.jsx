// resources/js/Components/liberian/ReservationCard.jsx
import { User, BookOpen, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ReservationCard({ reservation, onConfirmPickup }) {
  const isNotified = reservation.status === 'notified';
  const expiresAt = reservation.expires_at;

  return (
    <div className="flex gap-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      {/* Image */}
      <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
        <img 
          src={reservation.book?.cover_url || '/placeholder-book.jpg'} 
          alt={reservation.book?.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = '/placeholder-book.jpg'; }}
        />
      </div>

      <div className="flex-1">
        <h3 className="font-bold text-gray-900 dark:text-white text-base line-clamp-2 mb-1">
          {reservation.book?.title}
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {reservation.book?.author || 'Auteur inconnu'}
        </p>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
          <User className="w-3 h-3" />
          <span>{reservation.user?.name}</span>
          <span className="text-gray-300">•</span>
          <Calendar className="w-3 h-3" />
          <span>Réservé le : {new Date(reservation.created_at).toLocaleDateString()}</span>
        </div>

        {/* Statut */}
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg mb-3 ${
          isNotified 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20'
        }`}>
          {isNotified ? (
            <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
          )}
          <span className={`text-xs font-medium ${
            isNotified ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'
          }`}>
            {isNotified ? '📚 Livre disponible - En attente de retrait' : '⏳ En liste d\'attente'}
          </span>
        </div>

        {isNotified && expiresAt && (
          <div className="text-xs text-orange-600 dark:text-orange-400 mb-3">
            ⚠️ À récupérer avant le {new Date(expiresAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}