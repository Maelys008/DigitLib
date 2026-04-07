import MobileLayout from "@/Layouts/MobileLayout";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Users, Send, UserPlus, LogOut, Trash2, User, Loader2 } from "lucide-react";
import { router, usePage } from "@inertiajs/react";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function ClubsShow() {
    const { props } = usePage();
    const { id } = props;
    const { user } = useAuth();

    const [club, setClub] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingMessageId, setDeletingMessageId] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadClub();
    }, [id]);

    useEffect(() => {
        if (club?.is_joined) {
            loadMessages();
        } else if (club) {
            setIsLoading(false);
        }
    }, [club?.is_joined]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const loadClub = async () => {
        try {
            const data = await api.getClub(id);
            if (data && data.club) {
                setClub({
                    ...data.club,
                    is_joined: !!data.club.is_joined,
                });
            } else {
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Erreur chargement club:", error);
            setIsLoading(false);
        }
    };

    const loadMessages = async () => {
        try {
            const data = await api.getClubMessages(id);
            setMessages(data || []);
        } catch (error) {
            console.error("Erreur chargement messages:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoin = async () => {
        setIsJoining(true);
        try {
            const result = await api.joinClub(id);
            if (result.success) {
                await loadClub();
            }
        } catch (error) {
            console.error("Erreur adhésion:", error);
        } finally {
            setIsJoining(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        setIsSending(true);
        try {
            const result = await api.sendClubMessage(id, newMessage);
            if (result.success) {
                setNewMessage("");
                await loadMessages();
            }
        } catch (error) {
            console.error("Erreur envoi message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!confirm("Supprimer ce message ?")) return;
        setDeletingMessageId(messageId);
        try {
            const result = await api.deleteMessage(messageId);
            if (result.success) {
                await loadMessages();
            }
        } catch (error) {
            console.error("Erreur suppression message:", error);
        } finally {
            setDeletingMessageId(null);
        }
    };

    const handleLeave = async () => {
        if (!confirm("Voulez-vous vraiment quitter ce club ?")) return;
        setIsLeaving(true);
        try {
            const result = await api.leaveClub(id);
            if (result.success) {
                await loadClub();
            }
        } catch (error) {
            console.error("Erreur départ club:", error);
        } finally {
            setIsLeaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Êtes-vous sûr ? Cela supprimera TOUS les messages et membres de ce club.")) return;
        setIsDeleting(true);
        try {
            const result = await api.deleteClub(id);
            if (result.success) {
                router.visit("/clubs");
            }
        } catch (error) {
            alert("Erreur lors de la suppression");
        } finally {
            setIsDeleting(false);
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

        if (diffMinutes < 1) return "À l'instant";
        if (diffMinutes < 60) return `Il y a ${diffMinutes}min`;
        if (diffMinutes < 1440) return `Il y a ${Math.floor(diffMinutes / 60)}h`;
        return `Il y a ${Math.floor(diffMinutes / 1440)}j`;
    };

    if (isLoading) {
        return (
            <MobileLayout>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
            </MobileLayout>
        );
    }

    if (!club) {
        return (
            <MobileLayout>
                <div className="text-center py-12 px-6">
                    <p className="text-gray-500">Club non trouvé</p>
                    <button
                        onClick={() => router.visit("/clubs")}
                        className="mt-4 text-orange-600 font-medium"
                    >
                        Retour aux clubs
                    </button>
                </div>
            </MobileLayout>
        );
    }

    const isOwner = Number(club?.user_id) === Number(user?.id);
    const isMember = club?.is_joined;

    return (
        <MobileLayout>
            <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
                {/* Header avec retour */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
                    <button
                        onClick={() => router.visit("/clubs")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Retour aux clubs</span>
                    </button>

                    {/* Hero Section - MODIFIÉ : orange clair */}
                    <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-2xl p-6 text-orange-900 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                                <div className="w-16 h-16 bg-orange-300/50 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Users className="w-8 h-8 text-orange-700" />
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold mb-2 text-orange-900">{club.name}</h1>
                                    <p className="text-sm text-orange-700 mb-3">{club.description || "Aucune description"}</p>
                                    <div className="flex items-center gap-4 text-sm text-orange-800">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            <span>{club.members_count || 0} membres</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            <span>Par {club.creator?.name || "Inconnu"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isMember ? (
                                <button
                                    onClick={handleLeave}
                                    disabled={isLeaving}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 flex-shrink-0 disabled:opacity-50 shadow-md"
                                >
                                    {isLeaving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <LogOut className="w-4 h-4" />
                                    )}
                                    Quitter
                                </button>
                            ) : (
                                <button
                                    onClick={handleJoin}
                                    disabled={isJoining}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 flex-shrink-0 disabled:opacity-50 shadow-md"
                                >
                                    {isJoining ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <UserPlus className="w-4 h-4" />
                                    )}
                                    Rejoindre
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contenu - inchangé */}
                {isMember ? (
                    <>
                        <div className="flex-1 px-6 py-4 space-y-3 overflow-y-auto">
                            {messages.length === 0 ? (
                                <div className="text-center py-12 text-gray-400 text-sm">
                                    Aucun message. Soyez le premier !
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isCurrentUser = Number(msg.club_member?.user_id) === Number(user?.id);
                                    const canDelete = isCurrentUser || isOwner;

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className={`max-w-[75%] ${isCurrentUser ? "order-2" : "order-1"}`}>
                                                {!isCurrentUser && (
                                                    <p className="text-xs font-semibold text-gray-700 mb-1 ml-1">
                                                        {msg.club_member?.user?.name || "Membre"}
                                                    </p>
                                                )}
                                                <div className="relative group">
                                                    <div
                                                        className={`rounded-2xl p-4 ${
                                                            isCurrentUser
                                                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                                                                : "bg-white border-2 border-gray-200 text-gray-900"
                                                        }`}
                                                    >
                                                        <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                                                        <p
                                                            className={`text-xs mt-2 ${
                                                                isCurrentUser ? "text-orange-100" : "text-gray-500"
                                                            }`}
                                                        >
                                                            {formatTime(msg.created_at)}
                                                        </p>
                                                    </div>
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => handleDeleteMessage(msg.id)}
                                                            disabled={deletingMessageId === msg.id}
                                                            className="absolute top-2 -right-10 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg disabled:opacity-50"
                                                        >
                                                            {deletingMessageId === msg.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="bg-white border-t border-gray-100 px-6 py-4">
                            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Écrivez votre message..."
                                    className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={isSending || !newMessage.trim()}
                                    className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-orange-500/30"
                                >
                                    {isSending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center px-6">
                        <div className="text-center max-w-md">
                            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <Users className="w-12 h-12 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Rejoignez le club</h3>
                            <p className="text-gray-600 mb-6">
                                Vous devez être membre de ce club pour voir et participer aux discussions.
                            </p>
                            <button
                                onClick={handleJoin}
                                disabled={isJoining}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/30 inline-flex items-center gap-2 disabled:opacity-50"
                            >
                                {isJoining ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <UserPlus className="w-5 h-5" />
                                )}
                                Rejoindre maintenant
                            </button>
                        </div>
                    </div>
                )}

                {isOwner && isMember && (
                    <div className="px-6 py-3 border-t border-gray-100 bg-white">
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full py-3 text-red-600 font-medium hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {isDeleting ? "Suppression..." : "Supprimer le club"}
                        </button>
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}