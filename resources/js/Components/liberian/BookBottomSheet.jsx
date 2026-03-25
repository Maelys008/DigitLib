import { Fragment } from 'react';
import { Edit2, Trash2, X } from 'lucide-react';

export default function BookBottomSheet({ isOpen, onClose, onEdit, onDelete }) {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'edit', icon: Edit2, label: 'Modifier le livre', color: 'text-blue-600', onClick: onEdit },
    { id: 'delete', icon: Trash2, label: 'Supprimer le livre', color: 'text-red-600', onClick: onDelete },
  ];

  return (
    <>
    
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />
      
      
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 animate-slide-up">
        <div className="flex justify-center pt-4 pb-2">
          <div 
            className="w-12 h-1 bg-gray-300 rounded-full cursor-pointer"
            onClick={onClose}
          />
        </div>
        
        <div className="px-6 pb-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Options du livre</h3>
        </div>
        
      
        <div className="px-4 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  onClose();
                }}
                className="flex items-center gap-4 w-full px-4 py-4 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <Icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-sm text-gray-700">{item.label}</span>
              </button>
            );
          })}
        </div>
        
        
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </>
  );
}