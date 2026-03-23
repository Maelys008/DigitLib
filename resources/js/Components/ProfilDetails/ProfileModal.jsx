import { ChevronLeft } from 'lucide-react';
import Profile from '@/Pages/Profile';

export default function ProfileModal({ isOpen, onClose }) {
  console.log('Modal isOpen:', isOpen);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <button 
        onClick={onClose}
        className="fixed top-12 left-4 z-50 text-white"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <div className="fixed inset-x-0 bottom-0 top-24 bg-white rounded-t-3xl z-50 animate-slide-up overflow-y-auto scrollbar-hide">
        <div className="pt-8">
          <div className="px-4 pb-10">
            <Profile />
          </div>
        </div>
      </div>
    </>
  );
}