// resources/js/componentsLibrarian/AddBookModal.jsx

import { useState, useRef } from 'react';
import { X, Camera } from 'lucide-react';

// Liste des genres disponibles
const genresList = [
  'Science-Fiction', 'Sciences', 'Histoire', 'Classique', 'Mystère',
  'Fantasy', 'Roman', 'Horreur', 'Psychologie', 'Philosophie',
  'Poésie', 'Voyage', 'Cuisine', 'Programmation', 'Art',
  'Jeunesse', 'Thriller', 'Développement personnel'
];

export default function AddBookModal({ isOpen, onClose, onSubmit, libraryId }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
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
    // Efface le warning quand l'utilisateur modifie un champ
    if (warning) setWarning('');
  };

  const handleNumberChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    const newNbCopy = value;
    const newNbAvailable = value; // Par défaut, nb_available = nb_copy
    
    setFormData(prev => ({ 
      ...prev, 
      nb_copy: newNbCopy,
      nb_available: newNbAvailable
    }));
    
    // Vérification
    if (newNbCopy !== newNbAvailable) {
      setWarning('⚠️ Le nombre d\'exemplaires doit être égal au nombre de livres disponibles');
    } else {
      setWarning('');
    }
  };

  const handleAvailableChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    const newNbAvailable = value;
    const currentNbCopy = formData.nb_copy;
    
    setFormData(prev => ({ ...prev, nb_available: newNbAvailable }));
    
    // Vérification
    if (currentNbCopy !== newNbAvailable) {
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
    
    // Vérification finale avant soumission
    if (formData.nb_copy !== formData.nb_available) {
      setError('⚠️ Le nombre d\'exemplaires et le nombre de livres disponibles doivent être identiques');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('author', formData.author);
    data.append('genre', formData.genre);
    data.append('isbn', formData.isbn);
    data.append('description', formData.description);
    data.append('year_of_publication', formData.year_of_publication);
    data.append('nb_copy', formData.nb_copy);
    data.append('nb_available', formData.nb_available);
    data.append('library_id', libraryId);
    if (formData.cover_image) {
      data.append('cover_image', formData.cover_image);
    }

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
      title: '', author: '', genre: '', isbn: '', description: '',
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
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}
          
          {warning && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">
              {warning}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auteur *</label>
            <input type="text" name="author" value={formData.author} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Genre *</label>
            <select
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600"
              required
            >
              <option value="">Sélectionner un genre</option>
              {genresList.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
            <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Année de publication *</label>
            <input type="date" name="year_of_publication" value={formData.year_of_publication} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'exemplaires *</label>
            <input 
              type="number" 
              min="1" 
              name="nb_copy" 
              value={formData.nb_copy} 
              onChange={handleNumberChange} 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600" 
              required 
            />
            <p className="text-xs text-gray-400 mt-1">Nombre total d'exemplaires ajoutés à la bibliothèque</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Livres disponibles *</label>
            <input 
              type="number" 
              min="0" 
              max={formData.nb_copy}
              name="nb_available" 
              value={formData.nb_available} 
              onChange={handleAvailableChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600" 
              required 
            />
            <p className="text-xs text-gray-400 mt-1">
              Doit être égal au nombre total d'exemplaires (actuellement: {formData.nb_copy})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} name="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Couverture</label>
            <div className="flex items-center gap-4">
              <div 
                onClick={() => fileInputRef.current.click()}
                className="w-20 h-28 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors"
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <p className="text-xs text-gray-400">JPG, PNG (max 2MB)</p>
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