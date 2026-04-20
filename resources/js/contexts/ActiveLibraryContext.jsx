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
          // 🔥 Vérifie si la méthode getLibrary existe
          // Sinon, utilise getUserLibraries et trouve par ID
          let library = null;
          
          try {
            library = await api.getLibrary(libraryId);
          } catch (err) {
            console.log('getLibrary a échoué, tentative avec getUserLibraries');
            // Fallback: récupérer toutes les bibliothèques et trouver par ID
            const libraries = await api.getUserLibraries();
            library = libraries.find(lib => lib.id === parseInt(libraryId));
          }
          
          if (library) {
            setActiveLibrary(library);
            console.log('✅ Bibliothèque active chargée:', library?.name);
          } else {
            console.log('⚠️ Bibliothèque non trouvée, utilisation du fallback');
            setActiveLibrary({
              id: parseInt(libraryId),
              name: libraryName || 'Bibliothèque'
            });
          }
        } catch (error) {
          console.error('❌ Erreur chargement bibliothèque active:', error);
          setActiveLibrary({
            id: parseInt(libraryId),
            name: libraryName || 'Bibliothèque'
          });
        }
      }
      setIsLoading(false);
    };
    
    loadLibrary();
  }, []);

  const switchLibrary = (library) => {
    console.log('🔄 switchLibrary appelée:', library);
    setActiveLibrary(library);
    localStorage.setItem('active_library_id', library.id);
    localStorage.setItem('active_library_name', library.name);
  };

  const refreshActiveLibrary = async () => {
    const libraryId = localStorage.getItem('active_library_id');
    if (libraryId) {
      try {
        let library = null;
        try {
          library = await api.getLibrary(libraryId);
        } catch (err) {
          const libraries = await api.getUserLibraries();
          library = libraries.find(lib => lib.id === parseInt(libraryId));
        }
        if (library) {
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