import { livres as mockLivres } from '../data/mockData';

export const getBookCountByGenre = (genre, booksList = null) => {
  const booksToUse = booksList || mockLivres;

  const count = booksToUse.filter(livre => {
    // Sécuriser l'accès au genre
    if (!livre || !genre) return false;
    
    // Cas où genre est un objet avec une propriété name
    if (livre.genre && typeof livre.genre === 'object') {
      return livre.genre.name?.toLowerCase() === genre.toLowerCase();
    }
    
    // Cas où genre est une string
    if (livre.genre && typeof livre.genre === 'string') {
      return livre.genre.toLowerCase() === genre.toLowerCase();
    }
    
    // Cas où genre est dans une propriété genreName
    if (livre.genreName) {
      return livre.genreName.toLowerCase() === genre.toLowerCase();
    }
    
    return false;
  }).length;

  return count.toLocaleString('fr-FR');
};