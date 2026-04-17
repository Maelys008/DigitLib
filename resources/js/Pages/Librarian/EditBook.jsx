import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Camera, X, Save } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// Liste des genres disponibles 
const genresList = [
  'Science-Fiction', 'Sciences', 'Histoire', 'Classique', 'Mystère',
  'Fantasy', 'Roman', 'Horreur', 'Psychologie', 'Philosophie',
  'Poésie', 'Voyage', 'Cuisine', 'Programmation', 'Art',
  'Jeunesse', 'Thriller', 'Développement personnel'
];

export default function EditBook() {
  const { props } = usePage();
  const { id } = props;
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [coverPreview, setCoverPreview] = useState(null);
  const [newCoverFile, setNewCoverFile] = useState(null);
  const fileInputRef = useRef(null);

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

  useEffect(() => {
    const fetchBook = async () => {
      try {
        console.log('🔍 Chargement du livre ID:', id);
        const response = await api.getBook(id);
        console.log('📚 Réponse API:', response);
        setBook(response);
        
        // CORRECTION: Gérer year_of_publication correctement
        let yearValue = '';
        if (response.year_of_publication) {
          // Si c'est un nombre
          if (typeof response.year_of_publication === 'number') {
            yearValue = response.year_of_publication.toString();
          }
          // Si c'est une chaîne
          else if (typeof response.year_of_publication === 'string') {
            yearValue = response.year_of_publication.split('T')[0];
          }
          // Si c'est un objet Date
          else if (response.year_of_publication instanceof Date) {
            yearValue = response.year_of_publication.getFullYear().toString();
          }
          // Fallback
          else {
            yearValue = String(response.year_of_publication);
          }
        }
        
        // Récupérer l'ID du genre
        const genreId = response.genre_id || response.genre?.id || '';
        
        const coverImagePath = response.cover_image || response.cover_url;
        
        setFormData({
          title: response.title || '',
          author: response.author || '',
          genre_id: genreId,
          isbn: response.isbn || '',
          description: response.description || '',
          year_of_publication: yearValue,
          nb_copy: response.nb_copy || 1,
          nb_available: response.nb_available || 1,
          cover_image: null
        });
        
        if (coverImagePath) {
          setCoverPreview(`/storage/${coverImagePath}`);
        }
      } catch (error) {
        console.error('❌ Erreur chargement livre:', error);
        setError('Livre non trouvé');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (warning) setWarning('');
  };

  const handleNumberChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    const newNbCopy = value;
    const newNbAvailable = value;
    
    setFormData(prev => ({ 
      ...prev, 
      nb_copy: newNbCopy,
      nb_available: newNbAvailable
    }));
    
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
    
    if (currentNbCopy !== newNbAvailable) {
      setWarning('⚠️ Le nombre de livres disponibles doit être égal au nombre total d\'exemplaires');
    } else {
      setWarning('');
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCoverFile(file);
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
    data.append('_method', 'PUT');
    data.append('title', formData.title);
    data.append('author', formData.author);
    data.append('genre_id', formData.genre_id);
    data.append('isbn', formData.isbn);
    data.append('description', formData.description);
    data.append('year_of_publication', formData.year_of_publication);
    data.append('nb_copy', formData.nb_copy);
    
    if (newCoverFile) {
      data.append('cover_image', newCoverFile);
    }

    try {
      const response = await api.updateBook(id, data);
      if (response.success) {
        router.visit('/librarian/books');
      } else {
        setError(response.message || 'Erreur lors de la modification');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.visit('/librarian/books');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!book && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Livre non trouvé</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Modifier le livre</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
          >
            <Save className="w-4 h-4" /> Enregistrer
          </button>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        <form className="space-y-4" onSubmit={handleSubmit}>
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

          {/* Image de couverture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Couverture</label>
            <div className="flex items-center gap-4">
              <div 
                onClick={handleImageClick}
                className="w-24 h-32 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors"
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="Couverture" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <div>
                <p className="text-sm text-gray-500">Cliquez pour changer l'image</p>
                <p className="text-xs text-gray-400">JPG, PNG (max 2MB)</p>
              </div>
            </div>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600" 
              required 
            />
          </div>

          {/* Auteur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auteur *</label>
            <input 
              type="text" 
              name="author" 
              value={formData.author} 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600" 
              required 
            />
          </div>

          {/* Genre avec sélecteur */}
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
              {genresList.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          {/* ISBN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
            <input 
              type="text" 
              name="isbn" 
              value={formData.isbn} 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600" 
              required 
            />
          </div>

          {/* Année de publication */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Année de publication *</label>
            <input 
              type="number" 
              name="year_of_publication" 
              value={formData.year_of_publication} 
              onChange={handleChange} 
              min="1000"
              max={new Date().getFullYear()}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600" 
              required 
            />
          </div>

          {/* Nombre d'exemplaires */}
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
            <p className="text-xs text-gray-400 mt-1">Nombre total d'exemplaires</p>
          </div>

          {/* Livres disponibles */}
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

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              rows={4} 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none" 
            />
          </div>
        </form>
      </div>
    </div>
  );
}