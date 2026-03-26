import { Library as LibraryIcon } from 'lucide-react';

export default function LibraryInfoCard({ library }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 mb-6">
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-purple-100 flex items-center justify-center">
        {library.library_image ? (
          <img src={`/storage/${library.library_image}`} alt={library.name} className="w-full h-full object-cover" />
        ) : (
          <LibraryIcon className="w-8 h-8 text-purple-500" />
        )}
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">{library.name}</h2>
        <p className="text-sm text-gray-500">{library.adress}</p>
      </div>
    </div>
  );
}