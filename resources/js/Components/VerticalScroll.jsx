export default function VerticalScroll({ children, className = '' }) {
  return (
    <div className={`max-h-96 overflow-y-auto scrollbar-hide ${className}`}>
      <div className="space-y-3 pr-2">
        {children}
      </div>
    </div>
  );
}