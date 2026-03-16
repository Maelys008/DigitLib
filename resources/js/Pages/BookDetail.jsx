// resources/js/Pages/BookDetail.jsx

import MobileLayout from '@/Layouts/MobileLayout';
import { livres ,avis} from '../data/mockData';
import { useState } from 'react';
import { ArrowLeft, MoreVertical, Heart, Share2, BookOpen, User, Calendar, Star } from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react'; // Ajoute usePage ici
import HorizontalScroll from '@/Components/HorizontalScroll';
import BookCard from '@/Components/BookCard';
import { getPastelColor } from '@/Constants/colors';
import BookHeader from '@/Components/BookDetails/BookHeader'; 
import LibraryJoinButton from '@/Components/BookDetails/LibraryJoinButton';
import BorrowButton from '@/Components/BookDetails/BorrowButton';
import ReviewSection from '@/Components/BookDetails/ReviewSection';
	

export default function BookDetail() {
  const [isLiked, setIsLiked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
	const [isLibraryJoined, setIsLibraryJoined] = useState(false);
  const { props } = usePage();
  const { id } = props; // Récupère l'ID depuis la route
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  
  // Cherche le livre dans les données mockées
  const livre = livres.find(l => l.id === id);
  
  // Simulation de livres recommandés (même genre)
  const livresRecommandes = livres?.filter(l => l.genre === livre?.genre && l.id !== livre?.id).slice(0, 17) || [];
   
  const handleLibraryJoin = () => {
    setIsLibraryJoined(true);
    setShowJoinWarning(false); // Cache le warning si affiché
  };
	 const handleBorrow = () => {
    console.log('Livre emprunté !');
    // Logique d'emprunt
  };
	const [showJoinWarning, setShowJoinWarning] = useState(false);
     const avisDuLivre = avis.filter(a => a.livre_id === id);


  if (!livre) {
    return (
      <MobileLayout>
        <div className="px-6 py-20 text-center">
          <h2 className="text-xl font-bold text-gray-900">Livre non trouvé</h2>
          <p className="text-gray-500 mt-2">ID: {id}</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      {/* HEADER avec image de couverture - utilise BookHeader */}
      <BookHeader 
        imageUrl={livre.image_couverture}
        titre={livre.titre}
        onLike={(liked) => setIsLiked(liked)}
        isLiked={isLiked}
      />
				
					

				{/* SECTION INFOS PRINCIPALES */}
			<div className="px-6 pt-4">
						
						{/* MÉTADONNÉES - Chaque dans sa propre case */}
						<div className="grid grid-cols-4 gap-2 mb-4">
							{/* Auteur */}
							<div className="bg-gray-100 rounded-xl p-3 flex flex-col items-center">
								<User className="w-5 h-5 text-gray-600 mb-1" />
								<span className="text-xs text-gray-500">Auteur</span>
								<span className="text-sm font-semibold text-gray-900 text-center line-clamp-1">{livre.auteur}</span>
							</div>
							
							{/* Genre */}
							<div className="bg-gray-100 rounded-xl p-3 flex flex-col items-center">
								<BookOpen className="w-5 h-5 text-gray-600 mb-1" />
								<span className="text-xs text-gray-500">Genre</span>
								<span className="text-sm font-semibold text-gray-900 text-center line-clamp-1">{livre.genre}</span>
							</div>
							
							{/* Année */}
							<div className="bg-gray-100 rounded-xl p-3 flex flex-col items-center">
								<Calendar className="w-5 h-5 text-gray-600 mb-1" />
								<span className="text-xs text-gray-500">Année</span>
								<span className="text-sm font-semibold text-gray-900 text-center">{livre.annee_publication}</span>
							</div>
							
							{/* Note */}
							<div className="bg-gray-100 rounded-xl p-3 flex flex-col items-center">
								<Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mb-1" />
								<span className="text-xs text-gray-500">Note</span>
								<span className="text-sm font-semibold text-gray-900 text-center">{livre.note}</span>
							</div>
						</div>
					

        {/* BOUTON REJOINDRE BIBLIOTHÈQUE */}
				<div className="mb-6 pt-4"id="join-library-button">
            <LibraryJoinButton 
						bibliothequeNom={livre.bibliotheque?.nom || 'Bibliothèque'}
						onJoin={handleLibraryJoin}
						showWarning={showJoinWarning}
            onWarningClose={() => setShowJoinWarning(false)}
					/>
				</div>
					

        {/* DESCRIPTION */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">À propos du livre</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isDescriptionExpanded 
              ? livre.description 
              : `${livre.description.substring(0, 120)}...`}
          </p>
          <button 
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="text-gray-900 text-sm font-medium mt-1"
          >
            {isDescriptionExpanded ? 'Réduire' : 'Voir plus'}
          </button>
        </div>
           
      {/* BOUTON EMPRUNTER */}

      <BorrowButton 
        bibliothequeNom={livre.bibliotheque?.nom || 'Bibliothèque'}
        isLibraryJoined={isLibraryJoined}
        onBorrow={handleBorrow}
        onShowWarning={setShowJoinWarning} // Passe la fonction pour activer le warning
      />

        {/* SECTION AVIS */}
							<ReviewSection 
								reviews={avisDuLivre} // Passe les avis filtrés
								bookId={livre.id}
								bookTitle={livre.titre}
						/>

        {/* SECTION LIVRES RECOMMANDÉS */}
				{livresRecommandes.length > 0 && (
					<div className="mb-6">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-lg font-bold text-gray-900">{livre.genre}</h2>
							<Link 
								href={`/genres/${encodeURIComponent(livre.genre.toLowerCase())}`} 
								className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
							>
								Tous
							</Link>
						</div>
						<HorizontalScroll>
							{livresRecommandes.map((livreRec, index) => (
								<BookCard
									key={livreRec.id}
									livre={livreRec}
									variant="horizontal"
									backgroundColor={getPastelColor(index)}
								/>
							))}
						</HorizontalScroll>
					</div>
				)}
      </div>
    </MobileLayout>
  );
}