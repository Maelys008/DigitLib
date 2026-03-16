// resources/js/Pages/Home.jsx
import React from 'react';
import MobileLayout from '@/Layouts/MobileLayout';
import { currentUser, livres, genres, bibliotheques, notifications } from '../data/mockData';
import TopBar from '@/Components/TopBar';
import SectionHeader from '@/Components/SectionHeader';
import BookCard from '@/Components/BookCard';
import HorizontalScroll from '@/Components/HorizontalScroll';
import { getPastelColor } from '@/Constants/colors';
import { genreIcons } from '@/Constants/genreIcons';
import GenreCard from '@/Components/GenreCard';
import NewBookCard from '@/Components/NewBookCard';
import EditeurChip from '@/Components/EditeurChip';
import VerticalScroll from '@/Components/VerticalScroll';
export default function Home() {
  // Données pour les différentes sections
	const livresMemmbres = livres.filter(l => l.nb_disponibles > 0).slice(2, 17);
  const livresPopulaires = livres.filter(l => l.nb_disponibles > 0).slice(5, 17);
  const livresNouveaux = livres.slice(-6);
  const livresRomans = livres.filter(l => l.genre === 'Roman').slice(0, 17);
  
  // Maisons d'édition (simulées pour la maquette)
 // Dans Home.jsx - Maisons d'édition (12 éléments)
const maisonsEdition = [
  { id: 1, nom: 'BOMBORA' },
  { id: 2, nom: 'ROSEM' }, 
  { id: 3, nom: 'GALLIMARD' },
  { id: 4, nom: 'ACTES SUD' },
  { id: 5, nom: 'SEUIL' },
  { id: 6, nom: 'FLAMMARION' },
  { id: 7, nom: 'ALBIN MICHEL' },
  { id: 8, nom: 'STOCK' },
  { id: 9, nom: 'GRASSET' },
  { id: 10, nom: 'MINUIT' },
  { id: 11, nom: 'POL' },
  { id: 12, nom: 'DENOËL' }
];
   const genresAccueil = genres.slice(0, 6);

  // Notifications non lues
  const notificationsNonLues = notifications.filter(n => n.statut === 'non_lu');
  return (
    <MobileLayout>
      <TopBar 
        userName={currentUser.nom.split(' ')[0]}
        notificationsNonLues={notificationsNonLues.length}
      />

      {/* SECTION 1: Meilleurs du mois */}
      <div className="px-6 mt-2">
        <SectionHeader titre="Meilleurs du mois" voirToutLien="best-of-month" />
        <HorizontalScroll>
          {livresMemmbres.slice(0, 15).map((livre, index) => (
            <BookCard
              key={livre.id}
              livre={livre}
              variant="horizontal"
              backgroundColor={getPastelColor(index)}
            />
          ))}
        </HorizontalScroll>
      </div>

        {/* SECTION 2: Genres - Depuis mockData avec icônes de genreIcons */}
	
						<div className="px-6 mt-6">
							<SectionHeader titre="Genres" voirToutLien="/genres" />
							<div className="grid grid-cols-2 gap-3"> 
								{genresAccueil.slice(0, 6).map((genre, index) => {
									const IconComponent = genreIcons[genre];
									return (
										<GenreCard
											key={index}
											genre={genre}
											icon={IconComponent}
										/>
									);
								})}
							</div>
						</div>

      {/* SECTION 3: Nouveautés */}

			<div className="px-6 mt-6">
				<SectionHeader titre="Nouveautés" voirToutLien="/nouveautes" />
				<div className="space-y-3">
					{livresNouveaux.slice(0, 3).map((livre) => (
						<NewBookCard
							key={livre.id}
							livre={livre}
						/>
					))}
				</div>
			</div>

      {/* SECTION 4: Maisons d'édition */}
				<div className="px-6 mt-6">
					<SectionHeader titre="Maisons d'édition" voirToutLien="/editeurs" />
					<HorizontalScroll>
						{maisonsEdition.map((editeur, index) => (
							<EditeurChip key={editeur.id} isActive={index === 0}>
								{editeur.nom}
							</EditeurChip>
						))}
					</HorizontalScroll>
				</div>

      {/* SECTION 5: Populaires */}
      <div className="px-6 mt-6">
        <SectionHeader titre="Populaires" voirToutLien="/populaires" />
        <HorizontalScroll>
          {livresPopulaires.slice(0, 12).map((livre, index) => (
            <BookCard
              key={livre.id}
              livre={livre}
              variant="horizontal"
              backgroundColor={getPastelColor(index + 12)}
            />
          ))}
        </HorizontalScroll>
      </div>

      {/* SECTION 6: Roman */}
      <div className="px-6 mt-6 mb-20">
     <SectionHeader titre="Romans" voirToutLien="/romans" />
        <HorizontalScroll>
          {livresRomans.length > 0 ? (
            livresRomans.map((livre, index) => (
              <BookCard
                key={livre.id}
                livre={livre}
                variant="horizontal"
                backgroundColor={getPastelColor(index + 9)}
              />
            ))
          ) : (
            livresPopulaires.slice(0, 6).map((livre, index) => (
              <BookCard
                key={livre.id}
                livre={livre}
                variant="horizontal"
                backgroundColor={getPastelColor(index + 9)}
              />
            ))
          )}
        </HorizontalScroll>
      </div>
    </MobileLayout>
  );
}