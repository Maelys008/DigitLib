import MobileLayout from '@/Layouts/MobileLayout';
import { currentUser, livres, genres, bibliotheques, notifications } from '../data/mockData';
import TopBar from '@/Components/TopBar';
import SectionHeader from '@/Components/SectionHeader';
import BookCard from '@/Components/BookCard';
import HorizontalScroll from '@/Components/HorizontalScroll';
import { genreIcons } from '@/Constants/genreIcons';
import GenreCard from '@/Components/GenreCard';
import NewBookCard from '@/Components/NewBookCard';
import { getBookCountByGenre } from '../utils/getBookCountByGenre';

export default function Home() {
  // Données pour les différentes sections
	const livresMembres = livres.filter(l => l.nb_disponibles > 0).slice(2, 17);
  const livresPopulaires = livres.filter(l => l.nb_disponibles > 0).slice(5, 17);
  const livresNouveaux = livres.slice(-6);
  const livresRomans = livres.filter(l => l.genre === 'Roman').slice(0, 17);
  const genresAccueil = genres.slice(0, 6);
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
          {livresMembres.slice(0, 15).map((livre, index) => (
            <BookCard
              key={livre.id}
              livre={livre}
              variant="horizontal"
            />
          ))}
        </HorizontalScroll>
      </div>

        {/* SECTION 2: Genres */}
	
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
											  bookCount={getBookCountByGenre(genre)}
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

   

      {/* SECTION 5: Populaires */}
      <div className="px-6 mt-6">
        <SectionHeader titre="Populaires" voirToutLien="/populaires" />
        <HorizontalScroll>
          {livresPopulaires.slice(0, 12).map((livre, index) => (
            <BookCard
              key={livre.id}
              livre={livre}
              variant="horizontal"
            />
          ))}
        </HorizontalScroll>
      </div>

      {/* SECTION 6: livres dispo selon le genre*/}
      <div className="px-6 mt-6 mb-20">
     <SectionHeader titre="Romans" voirToutLien="/romans" />
        <HorizontalScroll>
          {livresRomans.length > 0 ? (
            livresRomans.map((livre, index) => (
              <BookCard
                key={livre.id}
                livre={livre}
                variant="horizontal"
              />
            ))
          ) : (
            livresPopulaires.slice(0, 6).map((livre, index) => (
              <BookCard
                key={livre.id}
                livre={livre}
                variant="horizontal"
              />
            ))
          )}
        </HorizontalScroll>
      </div>
    </MobileLayout>
  );
}