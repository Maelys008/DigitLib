// resources/js/utils/getBookCountByGenre.js

import { livres } from '../data/mockData';

export const getBookCountByGenre = (genre) => {
  const count = livres.filter(livre => 
    livre.genre.toLowerCase() === genre.toLowerCase()
  ).length;
  
  // Formatage avec séparateur de milliers
  return count.toLocaleString('fr-FR') ;
};