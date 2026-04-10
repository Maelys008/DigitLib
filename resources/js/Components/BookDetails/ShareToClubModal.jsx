import { useState, useEffect } from 'react';
import { X, Send, Users, Loader2, ExternalLink } from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function ShareToClubModal({ isOpen, onClose, bookId, bookTitle, bookAuthor, bookImage }) {
    const { user } = useAuth();
    const [clubs, setClubs] = useState([]);
    const [selectedClubId, setSelectedClubId] = useState(null);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [bookDetails, setBookDetails] = useState(null);

    useEffect(() => {
        const fetchBookDetails = async () => {
            if (!bookId) return;
            try {
                const data = await api.getBook(bookId);
                setBookDetails(data);
            } catch (error) {
                console.error('Erreur chargement livre:', error);
            }
        };
        if (isOpen) {
            fetchBookDetails();
            fetchMyClubs();
        }
    }, [isOpen, bookId]);

    const fetchMyClubs = async () => {
        setIsLoading(true);
        try {
            const allClubs = await api.getClubs();
            const myClubs = allClubs.filter(club => club.is_joined);
            setClubs(myClubs);
        } catch (error) {
            console.error('Erreur chargement clubs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleShare = async () => {
        if (!selectedClubId) return;
        
        setIsSending(true);
        try {
            // Utiliser un chemin relatif qui sera automatiquement converti par Inertia
            const bookLink = `/book/${bookId}`;
            const shareMessage = message || `Je vous recommande le livre "${bookTitle}" !`;
            const fullMessage = `${shareMessage}\n\n${bookLink}`;
            
            await api.sendClubMessage(selectedClubId, fullMessage);
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setSelectedClubId(null);
                setMessage('');
            }, 2000);
        } catch (error) {
            console.error('Erreur partage:', error);
        } finally {
            setIsSending(false);
        }
    };

    // Fonction pour rendre le lien cliquable dans le message
    const renderMessageWithLink = (text) => {
        const linkRegex = /\/book\/\d+/g;
        const parts = text.split(linkRegex);
        const matches = text.match(linkRegex);
        
        if (!matches) return text;
        
        const result = [];
        for (let i = 0; i < parts.length; i++) {
            result.push(parts[i]);
            if (matches[i]) {
                result.push(
                    <a
                        key={i}
                        href={matches[i]}
                        onClick={(e) => {
                            e.preventDefault();
                            router.visit(matches[i]);
                        }}
                        className="text-orange-600 hover:text-orange-700 underline cursor-pointer"
                    >
                        Voir le livre
                    </a>
                );
            }
        }
        return result;
    };

    if (!isOpen) return null;

    const displayBookTitle = bookTitle || bookDetails?.title;
    const displayBookAuthor = bookAuthor || bookDetails?.author;
    const displayBookImage = bookImage || bookDetails?.cover_url || bookDetails?.cover_image;
    const previewMessage = `Je vous recommande le livre "${displayBookTitle}" !\n\n/boek/${bookId}`;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
            
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-xl">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
                        <h3 className="font-semibold text-gray-900 text-lg">Partager dans un club</h3>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {success ? (
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8 text-green-600" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Partage reussi !</h4>
                            <p className="text-gray-500 text-sm">Le livre a ete partage dans le club</p>
                            <button
                                onClick={onClose}
                                className="mt-6 w-full py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    ) : (
                        <div className="p-6">
                            {/* Aperçu du livre */}
                            {displayBookTitle && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Livre a partager</h4>
                                    <div className="flex gap-3">
                                        {displayBookImage && (
                                            <img 
                                                src={displayBookImage} 
                                                alt={displayBookTitle}
                                                className="w-16 h-20 rounded-lg object-cover"
                                                onError={(e) => e.target.src = '/placeholder-book.jpg'}
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 line-clamp-2">{displayBookTitle}</p>
                                            {displayBookAuthor && (
                                                <p className="text-sm text-gray-500 mt-1">par {displayBookAuthor}</p>
                                            )}
                                            <div className="mt-2 p-2 bg-white rounded-lg border border-gray-200">
                                                <p className="text-xs text-gray-500 mb-1">Aperçu du message :</p>
                                                <p className="text-sm text-gray-700">{previewMessage}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                                </div>
                            ) : clubs.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">Vous n'etes membre d'aucun club</p>
                                    <button
                                        onClick={() => {
                                            onClose();
                                            router.visit('/clubs');
                                        }}
                                        className="mt-4 text-orange-600 text-sm font-medium"
                                    >
                                        Rejoindre un club
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Choisir un club
                                        </label>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {clubs.map((club) => (
                                                <div
                                                    key={club.id}
                                                    onClick={() => setSelectedClubId(club.id)}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                                                        selectedClubId === club.id
                                                            ? 'border-orange-500 bg-orange-50'
                                                            : 'border-gray-200 hover:border-orange-200'
                                                    }`}
                                                >
                                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                                                        <Users className="w-5 h-5 text-orange-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{club.name}</h4>
                                                        <p className="text-xs text-gray-500">{club.members_count} membres</p>
                                                    </div>
                                                    {selectedClubId === club.id && (
                                                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Message (optionnel)
                                        </label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Ajoutez un message personnalise..."
                                            rows={3}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                                        />
                                    </div>

                                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-xs text-blue-800">
                                            Info: Un lien vers le livre sera automatiquement ajoute a votre message. Les membres du club pourront cliquer dessus pour acceder au livre.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleShare}
                                        disabled={!selectedClubId || isSending}
                                        className="w-full py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSending ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Envoi...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Partager
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}