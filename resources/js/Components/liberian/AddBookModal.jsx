import { useState, useRef } from 'react';
import { X, Camera, Scan, Loader2 } from 'lucide-react';

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
  const [isScanning, setIsScanning] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const isbnInputRef = useRef(null);

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

  const startScanner = async () => {
    setShowScanner(true);
    setIsScanning(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Erreur accès caméra:', err);
      setError('Impossible d\'accéder à la caméra');
      setShowScanner(false);
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowScanner(false);
    setIsScanning(false);
  };

  const captureAndScan = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      const mockISBN = '978-2070612758';
      const mockBookData = {
        isbn: mockISBN,
        title: 'Le Petit Prince',
        author: 'Antoine de Saint-Exupéry',
        year_of_publication: 1943,
        description: 'Le Petit Prince est une œuvre poétique et philosophique...',
      };
      
      setFormData(prev => ({
        ...prev,
        isbn: mockBookData.isbn,
        title: prev.title || mockBookData.title,
        author: prev.author || mockBookData.author,
        year_of_publication: prev.year_of_publication || mockBookData.year_of_publication,
        description: prev.description || mockBookData.description,
      }));
      
      stopScanner();
    }
  };

  const handleScanISBN = () => {
    startScanner();
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
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl z-50 animate-slide-up max-h-[85vh] overflow-y-auto scrollbar-hide">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ajouter un livre</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleScanISBN}
              disabled={isScanning}
              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors disabled:opacity-50"
              title="Scanner l'ISBN"
            >
              <Scan className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Scanner caméra */}
        {showScanner && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-md mx-auto">
              <video
                ref={videoRef}
                className="w-full h-auto rounded-lg"
                autoPlay
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 border-2 border-orange-500 pointer-events-none" />
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={captureAndScan}
                className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold"
              >
                Scanner
              </button>
              <button
                onClick={stopScanner}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold"
              >
                Annuler
              </button>
            </div>
            <p className="text-white text-sm mt-4">Placez le code-barres dans le cadre</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          {warning && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-yellow-700 dark:text-yellow-400 text-sm">
              {warning}
            </div>
          )}
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span>Scannez l'ISBN pour auto-remplir les informations du livre</span>
          </div>

          {/* ISBN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ISBN *</label>
            <div className="relative">
              <input
                type="text"
                name="isbn"
                ref={isbnInputRef}
                value={formData.isbn}
                onChange={handleChange}
                placeholder="Ex: 978-2070612758"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                required
              />
              <button
                type="button"
                onClick={handleScanISBN}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 dark:text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Scannez le code-barres ou saisissez-le manuellement</p>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre *</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="Titre du livre"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" 
              required 
            />
          </div>

          {/* Auteur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Auteur *</label>
            <input 
              type="text" 
              name="author" 
              value={formData.author} 
              onChange={handleChange} 
              placeholder="Nom de l'auteur"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" 
              required 
            />
          </div>

          {/* Genre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Genre *</label>
            <select
              name="genre_id"
              value={formData.genre_id}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900 dark:text-white"
              required
            >
              <option value="">Sélectionner un genre</option>
              {genres.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Année publication */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Année de publication *</label>
            <input 
              type="number" 
              name="year_of_publication" 
              value={formData.year_of_publication} 
              onChange={handleChange} 
              placeholder="2024"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" 
              required 
            />
          </div>

          {/* Nombre d'exemplaires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre d'exemplaires *</label>
            <input 
              type="number" 
              min="1" 
              name="nb_copy" 
              value={formData.nb_copy} 
              onChange={handleNumberChange} 
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900 dark:text-white" 
              required 
            />
          </div>

          {/* Livres disponibles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Livres disponibles *</label>
            <input 
              type="number" 
              min="0" 
              max={formData.nb_copy} 
              name="nb_available" 
              value={formData.nb_available} 
              onChange={handleAvailableChange} 
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900 dark:text-white" 
              required 
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea 
              rows={3} 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Description du livre..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" 
            />
          </div>

          {/* Couverture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Couverture</label>
            <div className="flex items-center gap-4">
              <div 
                onClick={() => fileInputRef.current.click()} 
                className="w-20 h-28 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 transition-colors"
              >
                {coverPreview ? 
                  <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" /> : 
                  <Camera className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                }
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />
              <p className="text-xs text-gray-400 dark:text-gray-500">Format JPG, PNG (max 2MB)</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-orange-600 dark:bg-orange-500 text-white font-semibold py-4 rounded-xl hover:bg-orange-700 dark:hover:bg-orange-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
          >
            {isSubmitting ? 'Ajout en cours...' : 'Ajouter le livre'}
          </button>
        </form>
      </div>
    </>
  );
}