import MobileLayout from '@/Layouts/MobileLayout';
import { useState } from 'react';
import { ArrowLeft, Plus, CreditCard } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function MyCards() {
  const [cards] = useState([
    { id: 1, type: 'google', name: 'Google pay', number: null },
    { id: 2, type: 'apple', name: 'Apple pay', number: null },
    { id: 3, type: 'mastercard', name: '**** 6409', number: null },
    { id: 4, type: 'visa', name: '**** 0372', number: null }
  ]);

  return (
    <MobileLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        <div className="relative flex items-center justify-center px-4 py-4 bg-white">
          <button 
            onClick={() => router.visit('/profile')}
            className="absolute left-4 p-1"
          >
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-[17px] font-semibold text-black">Mes cartes</h1>
        </div>

        <div className="px-4 py-6 space-y-2">
          {cards.map((card) => (
            <div 
              key={card.id}
              className="flex items-center gap-4 p-4 bg-[#F2F2F7] rounded-xl transition-active active:opacity-70"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                {card.type === 'google' && <span className="font-bold text-xl">G</span>}
                {card.type === 'apple' && (
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 384 512">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                  </svg>
                )}
                {card.type === 'mastercard' && (
                  <div className="flex -space-x-2">
                    <div className="w-5 h-5 bg-red-500 rounded-full opacity-90" />
                    <div className="w-5 h-5 bg-yellow-500 rounded-full opacity-90" />
                  </div>
                )}
                {card.type === 'visa' && (
                  <span className="italic font-black text-blue-800 text-xs">VISA</span>
                )}
              </div>

              <span className="text-[16px] font-medium text-black">
                {card.name}
              </span>
            </div>
          ))}
          <button
            onClick={() => console.log('Ajouter')}
            className="w-full flex items-center justify-between p-4 bg-[#F2F2F7] rounded-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-black" />
              </div>
              <span className="text-[16px] font-medium text-black">Ajouter une carte</span>
            </div>
            <Plus className="w-5 h-5 text-gray-400 font-light" />
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}