import { ArrowLeft, Settings } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function DashboardHeader() {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.visit('/')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
        </div>
        <button onClick={() => router.visit('/librarian/settings')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
          <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
}