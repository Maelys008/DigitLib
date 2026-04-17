import { Link } from '@inertiajs/react';

export default function SectionHeader({ 
  titre, 
  voirToutLien = '#', 
  voirToutTexte = 'Tous',
  className = '' 
}) {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{titre}</h2>
      <Link 
        href={voirToutLien}
        className="text-gray-400 dark:text-gray-500 ms-5 font-medium text-body hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        {voirToutTexte}
      </Link>
    </div>
  );
}