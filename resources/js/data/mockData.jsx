
// Liste des badges possibles
export const badges = [
  {
    id: 1,
    nom: "Nouveau Lecteur",
    max_livres: 2,
    color: "bg-gray-500",
    icon: "👶"
  },
  {
    id: 2,
    nom: "Lecteur Régulier",
    max_livres: 4,
    color: "bg-blue-500",
    icon: "📚"
  },
  {
    id: 3,
    nom: "Lecteur Premium",
    max_livres: 6,
    color: "bg-purple-500",
    icon: "⭐"
  },
  {
    id: 4,
    nom: "Sous Surveillance",
    max_livres: 1,
    color: "bg-red-500",
    icon: "⚠️"
  }
];

// Utilisateur connecté (exemple)
export const currentUser = {
  id: 1,
  nom: "Jean Dupont",
  email: "jean.dupont@email.com",
  telephone: "+229 97 12 34 56",
  role: "lecteur",
  statut: "Actif",
  score: 850,
  badge_id: 3,
  badge: badges[2], // Lecteur Premium
  identite_verifiee: true,
  date_creation: "2025-01-15"
};

// Liste des bibliothèques
export const bibliotheques = [
  {
    id: 1,
    nom: "Bibliothèque Nationale du Bénin",
    adresse: "Cotonou, Avenue Steinmetz",
    description: "La plus grande bibliothèque du pays avec plus de 50 000 ouvrages",
    bibliotheque_parent_id: null,
    nb_livres: 52000,
    nb_membres: 12450,
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=600&fit=crop"
  },
  {
    id: 2,
    nom: "Bibliothèque Universitaire de Calavi",
    adresse: "Abomey-Calavi, Campus UAC",
    description: "Bibliothèque spécialisée en sciences et technologies",
    bibliotheque_parent_id: null,
    nb_livres: 28000,
    nb_membres: 8500,
    image: "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&h=600&fit=crop"
  },
  {
    id: 3,
    nom: "Bibliothèque Municipale de Porto-Novo",
    adresse: "Porto-Novo, Centre-ville",
    description: "Bibliothèque publique avec section jeunesse",
    bibliotheque_parent_id: null,
    nb_livres: 15000,
    nb_membres: 3200,
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=600&fit=crop"
  },
  {
    id: 4,
    nom: "Annexe Nationale - Akpakpa",
    adresse: "Cotonou, Akpakpa",
    description: "Annexe de la Bibliothèque Nationale",
    bibliotheque_parent_id: 1,
    nb_livres: 12000,
    nb_membres: 2800,
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=600&fit=crop"
  }
];

// Genres de livres
export const genres = [
  'Science-Fiction',
  'Sciences',
  'Histoire',
  'Classique',
  'Mystère',
  'Fantasy',
  'Roman',
  'Horreur',
  'Psychologie',
  'Philosophie',
  'Poésie',
  'Voyage',
  'Cuisine',
  'Programmation',
  'Art',
  'Jeunesse',
  'Thriller',
  'Développement personnel',
];

// Liste des livres
export const livres = [
  {
    id: 1,
    titre: "L'Étrange Destin de Wangrin",
    auteur: "Amadou Hampâté Bâ",
		note: 4.3,
    genre: "Roman",
    description: "Ce roman raconte l’histoire fascinante de Wangrin, un interprète africain travaillant pour l’administration coloniale. Grâce à son intelligence et à sa ruse, il parvient souvent à manipuler les situations à son avantage. Le livre montre les réalités complexes de la période coloniale en Afrique de l’Ouest. À travers des anecdotes et des événements marquants, l’auteur décrit les relations entre colons et populations locales. L’histoire mélange humour, critique sociale et réflexion sur le pouvoir. Ce récit captivant permet de mieux comprendre une époque importante de l’histoire africaine.",
    annee_publication: 1973,
    isbn: "978-2-264-04542-3",
    image_couverture: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    nb_exemplaires: 5,
    nb_disponibles: 2,
    bibliotheque_id: 1,
    bibliotheque: bibliotheques[0],
    mots_cles: ["Afrique", "Colonisation", "Histoire", "Culture"]
  },
  {
    id: 2,
    titre: "Les Soleils des Indépendances",
    auteur: "Ahmadou Kourouma",
		 note: 4.3,
    genre: "Roman",
    description: "Ce roman emblématique raconte la vie de Fama, un prince déchu vivant après les indépendances africaines. Autrefois respecté, il se retrouve confronté à une société en pleine transformation. Le livre montre les désillusions qui ont suivi les espoirs des indépendances. À travers le destin de Fama, l’auteur critique les nouvelles élites politiques et sociales. Le récit explore les conflits entre traditions et modernité. Cette œuvre majeure de la littérature africaine reste une réflexion profonde sur l’identité et le pouvoir.",
    annee_publication: 1968,
    isbn: "978-2-020-36040-5",
    image_couverture: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
    nb_exemplaires: 3,
    nb_disponibles: 0,
    bibliotheque_id: 1,
    bibliotheque: bibliotheques[0],
    mots_cles: ["Afrique", "Indépendance", "Politique", "Société"]
  },
  {
    id: 3,
    titre: "Une si longue lettre",
    auteur: "Mariama Bâ",
		 note: 4.3,
    genre: "Roman",
    description: "Ce roman prend la forme d’une longue lettre écrite par Ramatoulaye à son amie Aïssatou. Elle y raconte sa vie après la mort de son mari et les difficultés qu’elle a rencontrées. Le livre aborde des thèmes importants comme la polygamie, le mariage et la place de la femme dans la société. À travers son témoignage, l’héroïne exprime ses souffrances mais aussi sa force et sa dignité. L’auteur met en lumière les défis auxquels sont confrontées de nombreuses femmes africaines. Ce récit touchant est devenu un classique de la littérature africaine.",
    annee_publication: 1979,
    isbn: "978-2-070-40444-9",
    image_couverture: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
    nb_exemplaires: 4,
    nb_disponibles: 3,
    bibliotheque_id: 2,
    bibliotheque: bibliotheques[1],
    mots_cles: ["Féminisme", "Afrique", "Mariage", "Tradition"]
  },
  {
    id: 4,
    titre: "Le Monde s'effondre",
    auteur: "Chinua Achebe",
		 note: 4.3,
    genre: "Roman",
     description: "Ce roman raconte l’histoire d’Okonkwo, un guerrier respecté dans la société igbo du Nigeria. Fier et déterminé, il tente de préserver les traditions de son peuple. L’arrivée des missionnaires et de l’administration coloniale bouleverse cependant l’équilibre de la communauté. Le livre décrit les tensions entre les valeurs traditionnelles et les changements imposés par la colonisation. À travers le destin tragique d’Okonkwo, l’auteur montre l’impact profond de cette transformation. Cette œuvre est considérée comme l’un des plus grands romans africains.",
    annee_publication: 1958,
    isbn: "978-0-385-47454-2",
    image_couverture: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
    nb_exemplaires: 6,
    nb_disponibles: 4,
    bibliotheque_id: 2,
    bibliotheque: bibliotheques[1],
    mots_cles: ["Nigeria", "Colonisation", "Tradition", "Culture"]
  },
  {
    id: 5,
    titre: "Introduction à l'Intelligence Artificielle",
    auteur: "Stuart Russell",
		 note: 4.3,
    genre: "Sciences",
    description: "Ce livre est une référence incontournable pour comprendre les bases de l’intelligence artificielle. Il présente les concepts fondamentaux utilisés dans les systèmes intelligents modernes. Les auteurs expliquent comment les machines peuvent apprendre, raisonner et résoudre des problèmes. Le livre aborde également des domaines comme le machine learning, la recherche heuristique et les agents intelligents. De nombreux exemples permettent de comprendre les applications concrètes de l’IA. Cet ouvrage est largement utilisé par les étudiants et les professionnels en informatique.",
    annee_publication: 2020,
    isbn: "978-0-134-61099-3",
    image_couverture: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400&h=600&fit=crop",
    nb_exemplaires: 8,
    nb_disponibles: 5,
    bibliotheque_id: 2,
    bibliotheque: bibliotheques[1],
    mots_cles: ["IA", "Technologie", "Machine Learning", "Informatique"]
  },
  {
    id: 6,
    titre: "Histoire du Royaume d'Abomey",
    auteur: "Edna G. Bay",
		 note: 4.3,
    genre: "Histoire",
    description: "Ce livre retrace l’histoire du puissant royaume d’Abomey, situé dans l’actuel Bénin. Il explore l’organisation politique, militaire et culturelle de ce royaume africain. L’auteur met en lumière le rôle des célèbres Amazones du Dahomey dans la défense du royaume. Le récit décrit également les relations commerciales et diplomatiques avec les puissances étrangères. À travers des recherches historiques approfondies, le livre offre une vision détaillée de cette civilisation. Il permet de mieux comprendre l’héritage historique du Bénin.",
    annee_publication: 1998,
    isbn: "978-0-852-55548-5",
    image_couverture: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop",
    nb_exemplaires: 3,
    nb_disponibles: 2,
    bibliotheque_id: 3,
    bibliotheque: bibliotheques[2],
    mots_cles: ["Bénin", "Royaume", "Dahomey", "Amazones"]
  },
  {
    id: 7,
    titre: "Le Petit Prince",
    auteur: "Antoine de Saint-Exupéry",
		 note: 4.3,
    genre: "Jeunesse",
    description: "Ce célèbre conte philosophique raconte la rencontre entre un aviateur et un mystérieux petit prince venu d’une autre planète. À travers leurs conversations, le livre explore des thèmes profonds comme l’amitié, l’amour et la solitude. Le petit prince raconte ses voyages sur différentes planètes et les personnages étranges qu’il y a rencontrés. Chaque rencontre révèle une critique subtile de certains comportements humains. Le récit, simple en apparence, contient une grande richesse symbolique. Ce livre est apprécié aussi bien par les enfants que par les adultes.",
    annee_publication: 1943,
    isbn: "978-2-070-61275-8",
    image_couverture: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop",
    nb_exemplaires: 10,
    nb_disponibles: 7,
    bibliotheque_id: 3,
    bibliotheque: bibliotheques[2],
    mots_cles: ["Enfant", "Philosophie", "Aventure", "Classique"]
  },
  {
    id: 8,
    titre: "1984",
    auteur: "George Orwell",
		 note: 4.3,
    genre: "Science-Fiction",
    description: "Ce roman dystopique décrit une société totalitaire où chaque citoyen est constamment surveillé. Le personnage principal, Winston Smith, travaille pour un gouvernement qui contrôle l’information et la pensée. Peu à peu, il commence à douter du système et cherche la vérité. Le livre explore les dangers de la manipulation politique et de la surveillance permanente. L’auteur montre comment le pouvoir peut influencer la mémoire et la réalité. Cette œuvre reste aujourd’hui une référence majeure dans la critique des régimes autoritaires.",
    annee_publication: 1949,
    isbn: "978-0-452-28423-4",
    image_couverture: "https://images.unsplash.com/photo-1604866830893-c13cafa515d5?w=400&h=600&fit=crop",
    nb_exemplaires: 5,
    nb_disponibles: 1,
    bibliotheque_id: 1,
    bibliotheque: bibliotheques[0],
    mots_cles: ["Dystopie", "Politique", "Surveillance", "Futur"]
  },

 {
  id: 9,
  titre: "Psychologie des foules",
  auteur: "Gustave Le Bon",
  note: 4.5,
  genre: "Psychologie",
  description: "Cet ouvrage classique analyse le comportement des individus lorsqu’ils se trouvent dans une foule. L’auteur explique que les personnes peuvent agir très différemment en groupe qu’elles ne le feraient seules. Il étudie les mécanismes psychologiques qui influencent les émotions collectives. Le livre montre également comment les leaders peuvent influencer ou manipuler une foule. Cette analyse a marqué l’histoire de la psychologie sociale. L’ouvrage reste encore étudié dans les domaines de la sociologie, de la politique et de la communication.",
  annee_publication: 1895,
  isbn: "978-2-130-45678-9",
  image_couverture: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
  nb_exemplaires: 5,
  nb_disponibles: 3,
  bibliotheque_id: 1,
  bibliotheque: bibliotheques[0],
  mots_cles: ["Psychologie", "Foules", "Comportement"]
},
{
  id: 10,
  titre: "L'Interprétation des rêves",
  auteur: "Sigmund Freud",
  note: 4.4,
  genre: "Roman",
  description: "Dans ce livre majeur, Freud propose une analyse approfondie du rôle des rêves dans la vie psychique. Il explique que les rêves sont une voie d’accès privilégiée vers l’inconscient. À travers de nombreux exemples, il montre comment les désirs refoulés peuvent apparaître dans les rêves. Le livre présente aussi les méthodes d’interprétation utilisées en psychanalyse. Cette œuvre a profondément influencé la psychologie moderne. Elle reste aujourd’hui une référence incontournable pour comprendre l’inconscient.",
  annee_publication: 1900,
  isbn: "978-2-130-45679-6",
  image_couverture: "https://images.unsplash.com/photo-1528319725582-ddc096101511?w=400&h=600&fit=crop",
  nb_exemplaires: 4,
  nb_disponibles: 2,
  bibliotheque_id: 2,
  bibliotheque: bibliotheques[1],
  mots_cles: ["Psychologie", "Rêves", "Inconscient"]
},
{
  id: 11,
  titre: "Ainsi parlait Zarathoustra",
  auteur: "Friedrich Nietzsche",
  note: 4.6,
  genre: "Philosophie",
  description: "Ce livre philosophique raconte les discours du prophète Zarathoustra, personnage imaginé par Nietzsche. À travers ses enseignements, l’auteur développe ses idées sur la morale, la liberté et la transformation de l’homme. L’ouvrage introduit notamment le concept du surhomme. Il critique également certaines valeurs traditionnelles de la société. Le texte mélange philosophie, poésie et réflexion existentielle. Cette œuvre est considérée comme l’un des textes les plus importants de la philosophie moderne.",
  annee_publication: 1883,
  isbn: "978-2-070-45678-4",
  image_couverture: "https://images.unsplash.com/photo-1518744386442-2d48ac47a7eb?w=400&h=600&fit=crop",
  nb_exemplaires: 3,
  nb_disponibles: 1,
  bibliotheque_id: 3,
  bibliotheque: bibliotheques[2],
  mots_cles: ["Philosophie", "Nietzsche", "Surhomme"]
},
{
  id: 12,
  titre: "Le Mythe de Sisyphe",
  auteur: "Albert Camus",
  note: 4.5,
  genre: "Philosophie",
  description: "Dans cet essai philosophique, Camus réfléchit à la question du sens de la vie. Il s’inspire du mythe grec de Sisyphe, condamné à pousser éternellement un rocher en haut d’une montagne. Pour l’auteur, cette image symbolise la condition humaine face à l’absurde. Il explique que l’homme doit accepter cette absurdité tout en continuant à vivre pleinement. Le livre propose une réflexion profonde sur la liberté et la révolte. Cette œuvre est un texte fondamental de la philosophie de l’absurde.",
  annee_publication: 1942,
  isbn: "978-2-070-45679-1",
  image_couverture: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop",
  nb_exemplaires: 4,
  nb_disponibles: 2,
  bibliotheque_id: 1,
  bibliotheque: bibliotheques[0],
  mots_cles: ["Philosophie", "Absurde", "Camus"]
},

{
  id: 13,
  titre: "Germinal",
  auteur: "Émile Zola",
  note: 4.4,
  genre: "Roman",
  description: "Ce roman raconte la vie difficile des mineurs dans le nord de la France au XIXe siècle. Le personnage principal, Étienne Lantier, découvre les conditions de travail très dures dans les mines. Peu à peu, il devient un défenseur des ouvriers et participe à une grève importante. Le livre décrit avec réalisme la pauvreté, les injustices sociales et les luttes ouvrières. L’auteur montre aussi la solidarité entre les travailleurs. Ce roman est considéré comme l’une des plus grandes œuvres du naturalisme.",
  annee_publication: 1885,
  isbn: "978-2-070-45680-7",
  image_couverture: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
  nb_exemplaires: 5,
  nb_disponibles: 3,
  bibliotheque_id: 1,
  bibliotheque: bibliotheques[0],
  mots_cles: ["Mine", "Social", "France"]
},
{
  id: 14,
  titre: "Madame Bovary",
  auteur: "Gustave Flaubert",
  note: 4.5,
  genre: "Roman",
  description: "Ce roman raconte l’histoire d’Emma Bovary, une jeune femme mariée à un médecin de province. Elle rêve d’une vie passionnante et luxueuse, inspirée par les romans qu’elle lit. Insatisfaite de sa vie quotidienne, elle cherche à fuir la monotonie à travers différentes aventures. Ses choix la conduisent cependant à des difficultés financières et émotionnelles. Le livre critique les illusions romantiques et les conventions sociales de l’époque. Cette œuvre est un grand classique du réalisme littéraire.",
  annee_publication: 1857,
  isbn: "978-2-070-45681-4",
  image_couverture: 'https://images.unsplash.com/photo-1516908400650-cb3135aa8c7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBhZHZlbnR1cmUlMjBndWlkZXxlbnwxfHx8fDE3NzMxMzE1ODh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  nb_exemplaires: 4,
  nb_disponibles: 2,
  bibliotheque_id: 2,
  bibliotheque: bibliotheques[1],
  mots_cles: ["Adultère", "Province", "Réalisme"]
},
{
  id: 15,
  titre: "Les Misérables",
  auteur: "Victor Hugo",
  note: 4.8,
  genre: "Roman",
  description: "Ce roman monumental raconte le destin de Jean Valjean, ancien prisonnier cherchant à reconstruire sa vie. Après avoir rencontré un évêque bienveillant, il décide de devenir un homme juste. Cependant, il reste poursuivi par l’inspecteur Javert, représentant de la loi. L’histoire explore également la vie de plusieurs autres personnages marqués par la pauvreté et l’injustice. Le livre aborde des thèmes comme la rédemption, la justice et la solidarité. Cette œuvre est considérée comme l’un des plus grands romans de la littérature française.",
  annee_publication: 1862,
  isbn: "978-2-070-45682-1",
  image_couverture: 'https://images.unsplash.com/photo-1663868290007-e8df80a5b909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbmNlJTIwbm92ZWwlMjBsb3ZlJTIwc3Rvcnl8ZW58MXx8fHwxNzczMTMxNTg3fDA&ixlib=rb-4.1.0&q=80&w=1080',
  nb_exemplaires: 6,
  nb_disponibles: 4,
  bibliotheque_id: 3,
  bibliotheque: bibliotheques[2],
  mots_cles: ["Rédemption", "Justice", "Révolution"]
},
{
  id: 16,
  titre: "L'Assommoir",
  auteur: "Émile Zola",
  note: 4.3,
  genre: "Roman",
  description: "Ce roman raconte l’histoire de Gervaise, une blanchisseuse vivant dans un quartier populaire de Paris. Au début, elle espère construire une vie stable et heureuse. Cependant, les difficultés financières et les problèmes familiaux compliquent son existence. L’alcoolisme et la misère finissent par détruire peu à peu ses espoirs. Le livre décrit avec réalisme la vie du monde ouvrier au XIXe siècle. Cette œuvre illustre parfaitement le style naturaliste d’Émile Zola.",
  annee_publication: 1877,
  isbn: "978-2-070-45683-8",
  image_couverture: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
  nb_exemplaires: 3,
  nb_disponibles: 2,
  bibliotheque_id: 1,
  bibliotheque: bibliotheques[0],
  mots_cles: ["Alcoolisme", "Ouvriers", "Paris"]
},
{
  id: 17,
  titre: "Le Père Goriot",
  auteur: "Honoré de Balzac",
  note: 4.4,
  genre: "Roman",
  description: "Ce roman se déroule dans une pension modeste de Paris au début du XIXe siècle. Le personnage principal, le père Goriot, consacre toute sa fortune au bonheur de ses deux filles. Malheureusement, celles-ci profitent de sa générosité sans lui témoigner de reconnaissance. L’histoire montre les ambitions et les rivalités de la société parisienne. À travers différents personnages, l’auteur décrit les réalités sociales de son époque. Ce roman est l’une des œuvres majeures de la Comédie humaine de Balzac.",
  annee_publication: 1835,
  isbn: "978-2-070-45684-5",
  image_couverture: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop",
  nb_exemplaires: 4,
  nb_disponibles: 3,
  bibliotheque_id: 2,
  bibliotheque: bibliotheques[1],
  mots_cles: ["Paternité", "Ambition", "Paris"]
}
];

// Emprunts en cours de l'utilisateur
export const empruntsActifs = [
  {
    id: 1,
    utilisateur_id: 1,
    livre: livres[0],
    date_emprunt: "2026-02-28",
    date_retour_prevue: "2026-03-21",
    jours_restants: 9,
    statut: "en_cours"
  },
  {
    id: 2,
    utilisateur_id: 1,
    livre: livres[4],
    date_emprunt: "2026-03-05",
    date_retour_prevue: "2026-03-26",
    jours_restants: 14,
    statut: "en_cours"
  }
];

// Réservations de l'utilisateur
export const reservations = [
  {
    id: 1,
    utilisateur_id: 1,
    livre: livres[1],
    date_reservation: "2026-03-10",
    statut: "active",
    position: 2 // Position dans la file d'attente
  }
];

// Notifications
export const notifications = [
  {
    id: 1,
    utilisateur_id: 1,
    type: "rappel",
    message: "Votre livre 'L'Étrange Destin de Wangrin' est à rendre dans 9 jours",
    objet_id: 1,
    objet_type: "emprunt",
    statut: "non_lu",
    date_envoi: "2026-03-12"
  },
  {
    id: 2,
    utilisateur_id: 1,
    type: "livre_dispo",
    message: "Le livre 'Les Soleils des Indépendances' sera bientôt disponible",
    objet_id: 1,
    objet_type: "reservation",
    statut: "non_lu",
    date_envoi: "2026-03-11"
  },
  {
    id: 3,
    utilisateur_id: 1,
    type: "badge",
    message: "Félicitations ! Vous êtes passé au niveau Lecteur Premium 🎉",
    objet_id: 3,
    objet_type: "badge",
    statut: "lu",
    date_envoi: "2026-03-01"
  }
];

// Historique des emprunts
export const historiqueEmprunts = [
  {
    id: 10,
    utilisateur_id: 1,
    livre: livres[6],
    date_emprunt: "2026-01-15",
    date_retour_prevue: "2026-02-05",
    date_retour_reelle: "2026-02-03",
    statut: "rendu"
  },
  {
    id: 11,
    utilisateur_id: 1,
    livre: livres[3],
    date_emprunt: "2026-02-10",
    date_retour_prevue: "2026-03-03",
    date_retour_reelle: "2026-03-02",
    statut: "rendu"
  }
];
// resources/js/data/mockData.js

// Ajoute cette constante à la fin du fichier (avant les exports)

export const avis = [
  {
    id: 1,
    livre_id: 1, // L'Étrange Destin de Wangrin
    nom: "Jean Dupont",
    note: 5.0,
    date: "Il y a 2 jours",
    commentaire: "Excellent livre ! J'ai adoré la façon dont l'auteur aborde ce sujet complexe avec simplicité. Je le recommande vivement à tous ceux qui s'intéressent au développement personnel."
  },
  {
    id: 2,
    livre_id: 1,
    nom: "Marie Martin",
    note: 4.5,
    date: "Il y a 1 semaine",
    commentaire: "Très bon livre, bien écrit et plein d'enseignements. Quelques passages un peu longs mais globalement une excellente lecture."
  },
  {
    id: 3,
    livre_id: 1,
    nom: "Sophie Bernard",
    note: 5.0,
    date: "Il y a 3 jours",
    commentaire: "Une révélation ! Ce livre m'a ouvert les yeux sur beaucoup de choses. L'écriture est fluide et les concepts sont bien expliqués."
  },
  {
    id: 4,
    livre_id: 1,
    nom: "Thomas Petit",
    note: 4.0,
    date: "Il y a 5 jours",
    commentaire: "Bon livre dans l'ensemble, même si certains chapitres m'ont semblé un peu longs. La fin est particulièrement réussie."
  },
  {
    id: 5,
    livre_id: 1,
    nom: "Léa Dubois",
    note: 4.5,
    date: "Il y a 1 jour",
    commentaire: "Je l'ai dévoré en deux jours ! L'auteur a une plume magnifique et l'histoire est captivante du début à la fin."
  },
  {
    id: 6,
    livre_id: 1,
    nom: "Pierre Moreau",
    note: 5.0,
    date: "Il y a 4 jours",
    commentaire: "Un chef-d'œuvre. Chaque page est une pépite. Je le relirai sans aucun doute. À mettre entre toutes les mains."
  },
  {
    id: 7,
    livre_id: 7, // Le Petit Prince
    nom: "Alice Martin",
    note: 5.0,
    date: "Il y a 3 jours",
    commentaire: "Un classique intemporel ! Chaque relecture apporte son lot de nouvelles émotions et de réflexions."
  },
  {
    id: 8,
    livre_id: 7,
    nom: "Paul Durand",
    note: 4.5,
    date: "Il y a 1 semaine",
    commentaire: "Magnifique histoire qui touche le cœur des petits et des grands. Le langage simple mais profond de Saint-Exupéry est unique."
  }
];
