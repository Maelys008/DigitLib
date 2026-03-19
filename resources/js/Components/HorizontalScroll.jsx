export default function HorizontalScroll({ children, className = '' }) {
  return (
    <div className={`flex space-x-3 overflow-x-auto pb-2 scrollbar-hide ${className}`}>
      {children}
    </div>
  );
}
