import { Fragment } from 'react';
import { Heart, BookmarkPlus, Share2, Download, CheckCircle, X } from 'lucide-react';

export default function BottomSheet({ isOpen, onClose, onLike, isLiked }) {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'like', icon: Heart, label: isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris', color: isLiked ? 'text-red-500' : 'text-gray-700' },
    { id: 'shelf', icon: BookmarkPlus, label: 'Ajouter à ma liste', color: 'text-gray-700' },
    { id: 'share', icon: Share2, label: 'Partager', color: 'text-gray-700' },
    { id: 'download', icon: Download, label: 'Télécharger', color: 'text-gray-700' },
    { id: 'read', icon: CheckCircle, label: 'Marquer comme lu', color: 'text-gray-700' },
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
          <h3 className="font-semibold text-gray-900">Options</h3>
        </div>
        
        <div className="px-4 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'like') onLike();
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