import { livres as mockLivres } from '../data/mockData';

export const getBookCountByGenre = (genre, booksList = null) => {
  const booksToUse = booksList || mockLivres;

  const count = booksToUse.filter(livre => 
    livre.genre?.name?.toLowerCase() === genre.toLowerCase()
  ).length;

  return count.toLocaleString('fr-FR');
};