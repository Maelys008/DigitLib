import MobileLayout from "@/Layouts/MobileLayout";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Users, Loader2 } from "lucide-react";
import { router, usePage } from "@inertiajs/react";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function ClubsShow() {
    const { props } = usePage();
    const { clubId } = props;
    const { user } = useAuth();

    const [club, setClub] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadClub();
    }, [clubId]);

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
            const data = await api.getClub(clubId);
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
            const data = await api.getClubMessages(clubId);
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
            const result = await api.joinClub(clubId);
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
            const result = await api.sendClubMessage(clubId, newMessage);
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

    const handleLeave = async () => {
        if (!confirm("Voulez-vous vraiment quitter ce club ?")) return;
        setIsLeaving(true);
        try {
            const result = await api.leaveClub(clubId);
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
            const result = await api.deleteClub(clubId);
            if (result.success) {
                router.visit("/clubs");
            }
        } catch (error) {
            alert("Erreur lors de la suppression");
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <MobileLayout>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
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
                        className="mt-4 text-purple-600 font-medium"
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
                {/* En-tête unique */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.visit("/clubs")}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-gray-900 truncate">
                                    {club.name}
                                </h1>
                                {isOwner && (
                                    <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold">
                                        ADMIN
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Users className="w-3 h-3" />
                                <span>{club.members_count || 0} membres</span>
                            </div>
                        </div>

                        <div className="flex items-center">
                            {isOwner ? (
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="text-sm font-bold text-red-500 hover:text-red-700 disabled:opacity-50"
                                >
                                    {isDeleting ? "..." : "Supprimer"}
                                </button>
                            ) : isMember ? (
                                <button
                                    onClick={handleLeave}
                                    disabled={isLeaving}
                                    className="text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                >
                                    {isLeaving ? "..." : "Quitter"}
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Zone de contenu dynamique */}
                {isMember ? (
                    <>
                        {/* Liste des messages */}
                        <div className="flex-1 px-6 py-4 space-y-3 overflow-y-auto">
                            {messages.length === 0 ? (
                                <div className="text-center py-12 text-gray-400 text-sm">
                                    Aucun message. Soyez le premier !
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isCurrentUser = Number(msg.club_member?.user_id) === Number(user?.id);
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[75%] rounded-xl px-4 py-2 ${
                                                    isCurrentUser
                                                        ? "bg-purple-600 text-white"
                                                        : "bg-white border border-gray-100 shadow-sm"
                                                }`}
                                            >
                                                {!isCurrentUser && (
                                                    <p className="text-[10px] font-bold text-purple-600 mb-1">
                                                        {msg.club_member?.user?.name || "Membre"}
                                                    </p>
                                                )}
                                                <p className="text-sm break-words">
                                                    {msg.message}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input fixe en bas */}
                        <div className="bg-white border-t border-gray-100 px-6 py-4">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                    placeholder="Écrivez ici..."
                                    className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isSending || !newMessage.trim()}
                                    className="p-3 bg-purple-600 text-white rounded-xl disabled:opacity-50 active:scale-90 transition-transform"
                                >
                                    {isSending ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <Send className="w-6 h-6" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Écran d'adhésion si NON membre */
                    <div className="flex-1 flex flex-col items-center justify-center px-6">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center w-full max-w-sm">
                            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                                <Users className="w-10 h-10 text-purple-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Rejoindre le club
                            </h2>
                            <p className="text-gray-500 mb-8 text-center text-sm">
                                Vous devez être membre pour voir les messages et
                                participer à la discussion de ce club.
                            </p>
                            <button
                                onClick={handleJoin}
                                disabled={isJoining}
                                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 active:scale-95 transition-transform disabled:opacity-50"
                            >
                                {isJoining ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Adhésion...</span>
                                    </div>
                                ) : (
                                    "Devenir membre"
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}