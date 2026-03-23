import MobileLayout from '@/Layouts/MobileLayout';
import {useEffect , useState } from 'react';
import { ArrowLeft, Plus, MoreVertical, BookOpen } from 'lucide-react';
import { router } from '@inertiajs/react';
import { etageres } from '../data/mockData'; 

export default function Shelves() {
  const [shelves, setShelves] = useState(etageres);
	useEffect(() => {
    const savedShelves = localStorage.getItem('shelves');
    if (savedShelves) {
      setShelves(JSON.parse(savedShelves));
    } else {
      setShelves(etageres);
    }
  }, []);

  const handleCreateShelf = () => {
    router.visit('/shelves/create');
  };

  const handleShelfClick = (shelfId) => {
    router.visit(`/shelves/${shelfId}`);
  };

  const handleMenuClick = (e, shelfId) => {
    e.stopPropagation();
    console.log('Menu pour étagère', shelfId);
  };

  return (
    <MobileLayout>
      <div className="px-6 py-4">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.visit('/library')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Étagères</h1>
        </div>
							<div className="grid grid-cols-3 gap-4 mb-8">
								{shelves.map((shelf) => (
									<div
										key={shelf.id}
										onClick={() => handleShelfClick(shelf.id)}
										className="flex flex-col cursor-pointer active:opacity-70 transition-opacity"
									>
										<div className="aspect-square w-full max-w-[140px] mx-auto mb-1.5">
												<img
													src={shelf.image}
													alt={shelf.nom}
													className="w-full h-full rounded-lg object-cover shadow-sm"
												/>
										</div>
										<div className="text-left">
											<h3 className="text-[14px] font-bold text-black leading-tight line-clamp-2">
												{shelf.nom}
											</h3>
											<p className="text-[12px] text-gray-400 mt-0.5">
												{shelf.livreCount} livre{shelf.livreCount > 1 ? 's' : ''}
											</p>
										</div>
									</div>
								))}
							</div>
				<div className="px-4 pb-10">
						<button
							onClick={handleCreateShelf}
							className="w-full bg-[#1C1C1E] text-white font-medium py-4 rounded-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
						>
						  Créer une étagère
						</button>
				</div>
</div>
    </MobileLayout>
  );
}