import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { 
  ChevronDown, ChevronUp, Award, Trophy, Users, BookOpen, 
  Calendar, Clock, AlertCircle, CheckCircle, Info, 
  HelpCircle, Star, Zap, Shield, Gift, Sparkles, ArrowLeft
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Support() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('badges');
  const [userScore, setUserScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const profile = await api.getProfile();
      if (profile && profile.user) {
        setUserScore(profile.user.score || 0);
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };
  
  const handleGoBack = () => {
    router.visit('/profile');
  };

  // ==================== DONNÉES DES BADGES ====================
  const badges = [
    { 
      name: 'Bronze', 
      icon: <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />,
      color: 'from-orange-500 to-orange-800',
      bgLight: 'bg-orange-100 dark:bg-orange-900/30',
      textColor: 'text-orange-950 dark:text-orange-100',
      pointsNeeded: 0,
      maxBooks: 2,
      description: 'Votre premier pas dans l\'aventure DigiLib',
      perks: ['Emprunter jusqu\'à 2 livres', 'Accès aux clubs de lecture', 'Participation aux événements']
    },
    { 
      name: 'Argent', 
      icon: <Award className="w-6 h-6 text-gray-600 dark:text-gray-400" />,
      color: 'from-gray-400 to-gray-600',
      bgLight: 'bg-gray-50 dark:bg-gray-800',
      textColor: 'text-gray-700 dark:text-gray-300',
      pointsNeeded: 50,
      maxBooks: 4,
      description: 'Vous commencez à devenir un lecteur assidu',
      perks: ['Emprunter jusqu\'à 4 livres', 'Priorité sur les réservations', 'Accès aux clubs privés']
    },
    { 
      name: 'Or', 
      icon: <Award className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />,
      color: 'from-yellow-400 to-yellow-600',
      bgLight: 'bg-yellow-50 dark:bg-yellow-900/30',
      textColor: 'text-yellow-700 dark:text-yellow-100',
      pointsNeeded: 150,
      maxBooks: 6,
      description: 'Lecteur confirmé, vous êtes un pilier de la communauté',
      perks: ['Emprunter jusqu\'à 6 livres', 'Réduction sur les pénalités', 'Invitation aux événements VIP']
    },
    { 
      name: 'Platine', 
      icon: <Award className="w-6 h-6 text-orange-500 dark:text-orange-400" />,
      color: 'from-orange-400 to-red-500',
      bgLight: 'bg-orange-50 dark:bg-orange-900/30',
      textColor: 'text-orange-900 dark:text-orange-100',
      pointsNeeded: 350,
      maxBooks: 10,
      description: 'Expert en lecture, vous inspirez les autres',
      perks: ['Emprunter jusqu\'à 10 livres', 'Aucune pénalité de retard', 'Création de clubs', 'Badge exclusif']
    },
    { 
      name: 'Diamant', 
      icon: <Award className="w-6 h-6 text-blue-500 dark:text-blue-400" />,
      color: 'from-blue-400 to-blue-600',
      bgLight: 'bg-blue-50 dark:bg-blue-900/30',
      textColor: 'text-blue-700 dark:text-blue-100',
      pointsNeeded: 700,
      maxBooks: 15,
      description: 'Maître des livres, vous êtes une légende',
      perks: ['Emprunter jusqu\'à 15 livres', 'Accès anticipé aux nouveautés', 'Cadeaux exclusifs', 'Mentor pour nouveaux lecteurs']
    },
    { 
      name: 'Légendaire', 
      icon: <Sparkles className="w-6 h-6 text-pink-500 dark:text-pink-400" />,
      color: 'from-indigo-600 to-pink-600',
      bgLight: 'bg-indigo-100 dark:bg-indigo-900/30',
      textColor: 'text-indigo-950 dark:text-indigo-100',
      pointsNeeded: 1200,
      maxBooks: 25,
      description: 'Légende vivante de DigiLib',
      perks: ['Emprunter jusqu\'à 25 livres', 'Statut de légende', 'Livres dédicacés', 'Rencontres avec auteurs']
    }
  ];

  // Trouver le badge actuel et le prochain
  const currentBadge = badges.reduce((prev, curr) => {
    if (userScore >= curr.pointsNeeded) return curr;
    return prev;
  }, badges[0]);

  const nextBadge = badges.find(b => b.pointsNeeded > userScore);
  
  let progressPercentage = 0;
  let pointsToNext = 0;
  
  if (nextBadge) {
    const currentBadgePoints = currentBadge.pointsNeeded;
    const nextBadgePoints = nextBadge.pointsNeeded;
    pointsToNext = nextBadgePoints - userScore;
    progressPercentage = ((userScore - currentBadgePoints) / (nextBadgePoints - currentBadgePoints)) * 100;
  } else {
    progressPercentage = 100;
    pointsToNext = 0;
  }

  // ==================== FAQ ====================
  const faqs = [
    {
      question: "Comment emprunter un livre ?",
      answer: "1. Trouvez le livre qui vous intéresse\n2. Vérifiez qu'il est disponible\n3. Cliquez sur 'Emprunter'\n4. Récupérez votre livre à la bibliothèque dans les 48h\n5. Profitez de votre lecture !"
    },
    {
      question: "Combien de temps puis-je garder un livre ?",
      answer: "La durée d'emprunt dépend de votre bibliothèque (généralement 14 jours). Vous pouvez prolonger si aucun autre lecteur n'a réservé le livre."
    },
    {
      question: "Comment gagner des points ?",
      answer: "Vous gagnez des points en :\n• Retournant les livres à l'heure (+10 points)\n• Retournant en avance (+10 à +20 points)\n• Participant aux clubs de lecture (+5 points)\n• Recommandant l'app à un ami (+20 points)"
    },
    {
      question: "Que se passe-t-il en cas de retard ?",
      answer: "En cas de retard, vous perdez des points (2 points par jour de retard, max 30 points) et une pénalité financière s'applique selon la bibliothèque."
    },
    {
      question: "Comment fonctionnent les clubs de lecture ?",
      answer: "Les clubs de lecture sont des groupes de lecteurs partageant les mêmes intérêts. Vous pouvez :\n• Rejoindre un club existant\n• Créer votre propre club (à partir du badge Argent)\n• Participer aux discussions\n• Proposer des lectures communes\n• Organiser des rencontres virtuelles"
    },
    {
      question: "Comment être averti des retards ?",
      answer: "Vous recevez des notifications par email et dans l'application :\n• 3 jours avant la date de retour\n• Le jour du retour\n• En cas de dépassement"
    }
  ];

  // ==================== RÈGLES DES CLUBS ====================
  const clubRules = [
    { icon: Users, title: "Création de club", desc: "Disponible à partir du badge Argent (50 points)" },
    { icon: BookOpen, title: "Nombre de membres", desc: "Minimum 5 membres, maximum 50 par club" },
    { icon: Calendar, title: "Lectures mensuelles", desc: "1 livre minimum à lire et discuter par mois" },
    { icon: Clock, title: "Inactivité", desc: "Un club inactif pendant 3 mois est automatiquement fermé" },
    { icon: AlertCircle, title: "Comportement", desc: "Respectez les autres membres (tolérance zéro pour le harcèlement)" },
    { icon: CheckCircle, title: "Avantages", desc: "Accès aux lectures exclusives, rencontres avec auteurs" }
  ];

  // ==================== COMMENT GAGNER DES POINTS ====================
  const waysToEarnPoints = [
    { action: "Retour à l'heure", points: "+10", icon: CheckCircle, color: "text-green-600 dark:text-green-400" },
    { action: "Retour en avance", points: "+10 à +20", icon: Zap, color: "text-blue-600 dark:text-blue-400" },
    { action: "Participation club", points: "+5", icon: Users, color: "text-purple-600 dark:text-purple-400" },
    { action: "Recommandation", points: "+20", icon: Gift, color: "text-pink-600 dark:text-pink-400" },
    { action: "Avis de livre", points: "+3", icon: Star, color: "text-yellow-600 dark:text-yellow-400" }
  ];

  const waysToLosePoints = [
    { action: "Retard (par jour)", points: "-2", icon: Clock, color: "text-red-600 dark:text-red-400" },
    { action: "Non-retour", points: "-30", icon: AlertCircle, color: "text-red-600 dark:text-red-400" }
  ];

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        {/* En-tête avec flèche de retour */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-700 text-white px-6 pt-8 pb-6 rounded-b-3xl shadow-lg">
          <button 
            onClick={handleGoBack}
            className="mb-4 p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>

          <h1 className="text-2xl font-bold mb-2">Aide & Support</h1>
          <p className="text-orange-100 text-sm">Tout ce que vous devez savoir pour profiter de DigiLib</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-2 rounded-t-2xl mx-4">
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-4 text-center font-medium transition-all ${
              activeTab === 'badges'
                ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Award className="w-5 h-5 inline-block mr-2" />
            Badges
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-4 text-center font-medium transition-all ${
              activeTab === 'faq'
                ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <HelpCircle className="w-5 h-5 inline-block mr-2" />
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('clubs')}
            className={`flex-1 py-4 text-center font-medium transition-all ${
              activeTab === 'clubs'
                ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Users className="w-5 h-5 inline-block mr-2" />
            Clubs
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* ==================== SECTION BADGES ==================== */}
          {activeTab === 'badges' && (
            <>
              {/* Points actuels - DYNAMIQUE */}
              <div className="bg-gradient-to-r from-amber-50 to-blue-50 dark:from-amber-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-amber-100 dark:border-amber-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Votre score actuel</p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{userScore} pts</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Badge actuel</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{currentBadge?.name || 'Débutant'}</p>
                  </div>
                </div>
                
                {nextBadge ? (
                  <>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-amber-600 dark:bg-amber-500 rounded-full h-2 transition-all duration-500" style={{ width: `${Math.min(100, progressPercentage)}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <span>{currentBadge.name} ({currentBadge.pointsNeeded} pts)</span>
                      <span>{nextBadge.name} ({nextBadge.pointsNeeded} pts)</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Plus que <strong>{pointsToNext} points</strong> pour atteindre le badge <strong>{nextBadge.name}</strong>
                    </p>
                  </>
                ) : (
                  <div className="mt-2 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xs text-green-700 dark:text-green-400 font-medium text-center">
                      🎉 Félicitations ! Vous avez atteint le badge {currentBadge.name}, le plus haut niveau !
                    </p>
                  </div>
                )}
              </div>

              {/* Liste des badges - avec indicateur de déblocage */}
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-4 mb-3">Tous les badges</h2>
              {badges.map((badge, index) => {
                const isUnlocked = userScore >= badge.pointsNeeded;
                const isCurrent = currentBadge?.name === badge.name;
                
                return (
                  <div key={index} className={`rounded-2xl overflow-hidden border ${badge.bgLight} ${isCurrent ? 'ring-2 ring-orange-400 dark:ring-orange-500' : ''}`}>
                    <div className={`bg-gradient-to-r ${badge.color} px-4 py-3 text-white`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {badge.icon}
                          <span className="font-bold text-lg">{badge.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isUnlocked ? (
                            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-medium">✅ Débloqué</span>
                          ) : (
                            <span className="text-xs bg-black/20 px-2 py-1 rounded-full">{badge.pointsNeeded} pts requis</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800">
                      <p className={`text-sm ${badge.textColor} mb-3`}>{badge.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">Jusqu'à <strong>{badge.maxBooks}</strong> livres</span>
                        </div>
                        {badge.perks.map((perk, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                            <span className="text-gray-600 dark:text-gray-400">{perk}</span>
                          </div>
                        ))}
                      </div>
                      {isCurrent && !nextBadge && (
                        <div className="mt-3 p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <p className="text-xs text-orange-700 dark:text-orange-400 font-medium text-center">⭐ Votre badge actuel</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Comment gagner/perdre des points */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 mt-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">📈 Gagner des points</h3>
                <div className="space-y-3">
                  {waysToEarnPoints.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                        <span className="text-gray-700 dark:text-gray-300">{item.action}</span>
                      </div>
                      <span className={`font-semibold ${item.color}`}>{item.points}</span>
                    </div>
                  ))}
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white mt-6 mb-4">📉 Perdre des points</h3>
                <div className="space-y-3">
                  {waysToLosePoints.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                        <span className="text-gray-700 dark:text-gray-300">{item.action}</span>
                      </div>
                      <span className={`font-semibold ${item.color}`}>{item.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ==================== SECTION FAQ ==================== */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-5 pb-5 pt-0 text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line border-t border-gray-100 dark:border-gray-700">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ==================== SECTION CLUBS ==================== */}
          {activeTab === 'clubs' && (
            <>
              {/* Introduction */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-pink-100 dark:border-pink-800">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Clubs de lecture</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Rejoignez une communauté de passionnés, partagez vos lectures, 
                  découvrez de nouveaux livres et participez à des événements exclusifs.
                </p>
              </div>

              {/* Règles */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  Règles et fonctionnement
                </h3>
                <div className="space-y-4">
                  {clubRules.map((rule, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <rule.icon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{rule.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{rule.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comment ça marche */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">📖 Comment rejoindre un club ?</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">Onglet <strong>"Clubs"</strong> dans le menu principal</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">Parcourez les clubs disponibles</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">Cliquez sur <strong>"Rejoindre"</strong></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">Participez aux discussions et lectures</p>
                  </div>
                </div>
              </div>

              {/* Avantages des clubs */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                  Avantages
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                    <span className="text-gray-700 dark:text-gray-300">Rencontres virtuelles avec des auteurs</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                    <span className="text-gray-700 dark:text-gray-300">Lectures exclusives en avant-première</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                    <span className="text-gray-700 dark:text-gray-300">Points bonus (5 points par participation)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                    <span className="text-gray-700 dark:text-gray-300">Badges exclusifs de club</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}