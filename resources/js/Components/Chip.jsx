// resources/js/Components/Chip.jsx

export default function Chip({ 
  children, 
  icon: Icon, 
  onClick,
  isActive = false,
  className = '' 
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
        transition-all duration-200 whitespace-nowrap
        ${isActive 
          ? 'bg-purple-600 text-white shadow-md' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
        ${className}
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </button>
  );
}