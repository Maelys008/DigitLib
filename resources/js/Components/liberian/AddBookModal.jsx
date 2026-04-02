import { useState, useRef } from 'react';
import { X, Camera } from 'lucide-react';

export default function AddBookModal({ isOpen, onClose, onSubmit, libraryId, genres }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre_id: '',
    isbn: '',
    description: '',
    year_of_publication: '',
    nb_copy: 1,
    nb_available: 1,
    cover_image: null
  });
  const [coverPreview, setCoverPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (warning) setWarning('');
  };

  const handleNumberChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setFormData(prev => ({ 
      ...prev, 
      nb_copy: value,
      nb_available: value
    }));
    setWarning('');
  };

  const handleAvailableChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setFormData(prev => ({ ...prev, nb_available: value }));
    if (value !== formData.nb_copy) {
      setWarning('⚠️ Le nombre de livres disponibles doit être égal au nombre total d\'exemplaires');
    } else {
      setWarning('');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, cover_image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.nb_copy !== formData.nb_available) {
      setError('⚠️ Le nombre d\'exemplaires et le nombre de livres disponibles doivent être identiques');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    data.append('library_id', libraryId);

    const result = await onSubmit(data);
    setIsSubmitting(false);

    if (result.success) {
      resetForm();
      onClose();
    } else {
      setError(result.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', author: '', genre_id: '', isbn: '', description: '',
      year_of_publication: '', nb_copy: 1, nb_available: 1, cover_image: null
    });
    setCoverPreview(null);
    setError('');
    setWarning('');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ajouter un livre</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
          {warning && <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">{warning}</div>}

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600" required />
          </div>

          {/* Auteur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auteur *</label>
            <input type="text" name="author" value={formData.author} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600" required />
          </div>

          {/* Genre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Genre *</label>
           <select
							name="genre_id"
							value={formData.genre_id}
							onChange={handleChange}
							className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600"
							required
						 >
							<option value="">Sélectionner un genre</option>
							{genres.map(g => (
								<option key={g.id} value={g.id}>{g.name}</option>
							))}
						</select>
          </div>

          {/* ISBN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
            <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600" required />
          </div>

          {/* Année publication */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Année de publication *</label>
            <input type="date" name="year_of_publication" value={formData.year_of_publication} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600" required />
          </div>

          {/* Nombre d'exemplaires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'exemplaires *</label>
            <input type="number" min="1" name="nb_copy" value={formData.nb_copy} onChange={handleNumberChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600" required />
          </div>

          {/* Livres disponibles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Livres disponibles *</label>
            <input type="number" min="0" max={formData.nb_copy} name="nb_available" value={formData.nb_available} onChange={handleAvailableChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600" required />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} name="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none" />
          </div>

          {/* Couverture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Couverture</label>
            <div className="flex items-center gap-4">
              <div onClick={() => fileInputRef.current.click()} className="w-20 h-28 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors">
                {coverPreview ? <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 text-gray-400" />}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 text-white font-semibold py-4 rounded-xl hover:bg-purple-700 disabled:bg-gray-400 transition-colors">
            {isSubmitting ? 'Ajout en cours...' : 'Ajouter le livre'}
          </button>
        </form>
      </div>
    </>
  );
}