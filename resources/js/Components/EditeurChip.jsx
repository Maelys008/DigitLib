export default function EditeurChip({ 
  children, 
  onClick,
  isActive = false,
  className = '' 
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-10 py-5 bg-gray-100 text-gray-800 ms-2 font-medium text-body
        hover:bg-gray-200 transition-colors whitespace-nowrap
        ${isActive }
        ${className}
      `}
    >
      {children}
    </button>
  );
}