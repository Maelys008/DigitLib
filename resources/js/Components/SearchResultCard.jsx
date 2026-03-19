import { router } from '@inertiajs/react';

export default function SearchResultCard({ result, type }) {
  
  const handleClick = () => {
    if (type === 'author') {
      router.visit(`/author/${encodeURIComponent(result.nom)}`);
    } else {
      router.visit(`/book/${result.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100"
    >
      <p className="text-xs text-gray-500 mb-1 line-clamp-1">
        {type === 'book' ? result.auteurNom : result.nom}
      </p>
      
      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
        {type === 'book' ? result.titre : result.nom}
      </h3>
      <p className="text-xs text-gray-400">
        {type === 'book' ? result.genre : 'Auteur'}
      </p>
    </div>
  );
}