// resources/js/contexts/ActiveLibraryContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api';

const ActiveLibraryContext = createContext();

export function ActiveLibraryProvider({ children }) {
  const [activeLibrary, setActiveLibrary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLibrary = async () => {
      const libraryId = localStorage.getItem('active_library_id');
      const libraryName = localStorage.getItem('active_library_name');
      
      console.log('🔍 ActiveLibraryContext - chargement...');
      console.log('libraryId:', libraryId);
      
      if (libraryId) {
        try {
          // Tenter de récupérer la bibliothèque par ID
          let library = null;
          
          try {
            library = await api.getLibrary(libraryId);
          } catch (err) {
            console.log('Bibliothèque introuvable:', err.message);
            // Si la bibliothèque n'existe pas, on nettoie le localStorage
            localStorage.removeItem('active_library_id');
            localStorage.removeItem('active_library_name');
            setActiveLibrary(null);
            setIsLoading(false);
            return;
          }
          
          if (library && library.id) {
            setActiveLibrary(library);
            console.log('✅ Bibliothèque active chargée:', library.name);
          } else {
            console.log('⚠️ Bibliothèque non trouvée');
            setActiveLibrary(null);
          }
        } catch (error) {
          console.error('❌ Erreur chargement bibliothèque active:', error);
          localStorage.removeItem('active_library_id');
          localStorage.removeItem('active_library_name');
          setActiveLibrary(null);
        }
      } else {
        console.log('ℹ️ Aucune bibliothèque active sélectionnée');
        setActiveLibrary(null);
      }
      setIsLoading(false);
    };
    
    loadLibrary();
  }, []);

  const switchLibrary = (library) => {
    console.log('🔄 switchLibrary appelée:', library);
    setActiveLibrary(library);
    if (library && library.id) {
      localStorage.setItem('active_library_id', library.id);
      localStorage.setItem('active_library_name', library.name);
    }
  };

  const refreshActiveLibrary = async () => {
    const libraryId = localStorage.getItem('active_library_id');
    if (libraryId) {
      try {
        const library = await api.getLibrary(libraryId);
        if (library && library.id) {
          setActiveLibrary(library);
        }
      } catch (error) {
        console.error('Erreur refresh bibliothèque active:', error);
      }
    }
  };

  return (
    <ActiveLibraryContext.Provider value={{ 
      activeLibrary, 
      isLoading, 
      switchLibrary,
      refreshActiveLibrary 
    }}>
      {children}
    </ActiveLibraryContext.Provider>
  );
}

export const useActiveLibrary = () => {
  const context = useContext(ActiveLibraryContext);
  if (!context) {
    throw new Error('useActiveLibrary must be used within an ActiveLibraryProvider');
  }
  return context;
};