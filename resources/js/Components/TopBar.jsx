import { Bell } from 'lucide-react';
import { Link } from '@inertiajs/react';
export default function TopBar({ userName, notificationsNonLues = 0 }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-baseline gap-1">
        <p className="text-gray-600 font-bold text-xl">Salut,</p>
        <h1 className="text-xl font-bold text-gray-600">{userName}</h1>
      </div>
      
      <Link 
        href="/notifications"
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {notificationsNonLues > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
            {notificationsNonLues}
          </span>
        )}
      </Link>
    </div>
  );
}