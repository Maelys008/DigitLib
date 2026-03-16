// resources/js/Components/HorizontalScroll.jsx

export default function HorizontalScroll({ children, className = '' }) {
  return (
    <div className={`flex space-x-3 overflow-x-auto pb-2 scrollbar-hide ${className}`}>
      {children}
    </div>
  );
}

// Ajoute ceci dans ton fichier CSS global pour cacher la scrollbar
// .scrollbar-hide::-webkit-scrollbar {
//   display: none;
// }
// .scrollbar-hide {
//   -ms-overflow-style: none;
//   scrollbar-width: none;
// }