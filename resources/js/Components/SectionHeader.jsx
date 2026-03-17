// resources/js/Components/SectionHeader.jsx

import { Link } from '@inertiajs/react';

export default function SectionHeader({ 
  titre, 
  voirToutLien = '#', 
  voirToutTexte = 'Tous',
  className = '' 
}) {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <h2 className="text-lg font-bold text-gray-900">{titre}</h2>
      <Link 
        href={voirToutLien}
        className="text-gray-400  ms-5 font-medium text-body  hover:text-gray-600 transition-colors"
      >
        {voirToutTexte}
      </Link>
    </div>
  );
}