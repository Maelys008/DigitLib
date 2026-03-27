import { livres as mockLivres } from '../data/mockData';

export const getBookCountByGenre = (genre, booksList = null) => {

  const booksToUse = booksList || mockLivres;
  
  const count = booksToUse.filter(livre => 
    livre.genre?.toLowerCase() === genre.toLowerCase()
  ).length;
  
  return count.toLocaleString('fr-FR');
};

export const getBookCountByGenreLegacy = (genre) => {
  const count = mockLivres.filter(livre => 
    livre.genre.toLowerCase() === genre.toLowerCase()
  ).length;
  return count.toLocaleString('fr-FR');
};