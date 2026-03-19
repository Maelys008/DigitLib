import { router } from '@inertiajs/react';

export default function GenreCard({ 
  genre, 
  icon: Icon, 
  onClick,
  className = '' 
}) {
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.visit(`/genres/${encodeURIComponent(genre.toLowerCase())}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center gap-3 bg-[#F6F6F6] rounded-xl p-2 w-full text-left transition-all active:scale-95
        ${className}
      `}
    >
      <div className="w-14 h-14 bg-white border border-gray-900 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
        {Icon && <Icon className="w-8 h-8 text-gray-700" />}
      </div>
      <span className="text-sm font-bold text-gray-900">
        {genre}
      </span>
    </button>
  );
}