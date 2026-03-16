// resources/js/Components/GenreCard.jsx

export default function GenreCard({ 
  genre, 
  icon: Icon, 
  onClick,
  className = '' 
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 bg-[#F6F6F6] rounded-xl p-2 w-full text-left transition-all active:scale-95
        ${className}
      `}
    >
      {/* Cadre carré blanc avec bordure grise fine */}
      <div className="w-14 h-14 bg-white border border-gray-900 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
        {Icon && <Icon className="w-8 h-8 text-gray-700" />}
      </div>
      
      {/* Nom du genre avec texte plus gras */}
      <span className="text-sm font-bold text-gray-900">
        {genre}
      </span>
    </button>
  );
}