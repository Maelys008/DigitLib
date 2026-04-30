import axios from "axios";

class ApiService {
    constructor() {
        this.baseURL = "/api";
        this.axios = axios.create({
            baseURL: this.baseURL,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
             withCredentials: true,
        });

        this.axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem("auth_token");
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error),
        );

       this.axios.interceptors.response.use(
    (response) => response,
    (error) => {
        // 🔥 Évite la redirection si on est déjà sur la page de login
        const isLoginPage = window.location.pathname === '/login' || 
                           window.location.pathname === '/register' || 
                           window.location.pathname === '/verify-otp';
        
        if (error.response?.status === 401 && !isLoginPage) {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    },
);
    }

    // ==================== AUTHENTIFICATION ====================
    async register(email, password, passwordConfirmation) {
        try {
            const response = await this.axios.post("/register", { email, password, password_confirmation: passwordConfirmation });
            return { success: true, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur d'inscription" };
        }
    }

    async verifyOtp(email, otp) {
        try {
            const response = await this.axios.post("/verify-otp", { email, otp });
            const { token, user } = response.data;
            localStorage.setItem("auth_token", token);
            localStorage.setItem("user", JSON.stringify(user));
            return { success: true, user };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Code incorrect" };
        }
    }

    async resendOtp(email) {
        try {
            const response = await this.axios.post("/resend-otp", { email });
            return { success: true, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur d'envoi" };
        }
    }

    async login(email, password) {
        try {
            const response = await this.axios.post("/login", { email, password });
            const { access_token, user } = response.data;
            localStorage.setItem("auth_token", access_token);
            localStorage.setItem("user", JSON.stringify(user));
            return { success: true, user };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Identifiants incorrects" };
        }
    }

    async logout() {
        try {
            await this.axios.post("/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
        }
    }

    async completeProfile(name, tel, identityHash) {
        try {
            const response = await this.axios.post("/profil/complete", { name, tel, identity_hash: identityHash });
            const user = response.data.user;
            localStorage.setItem("user", JSON.stringify(user));
            return { success: true, user };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur de mise à jour" };
        }
    }

   // ==================== MOT DE PASSE OUBLIÉ ====================
async forgotPassword(email) {
    try {
        const response = await this.axios.post("/forgot-password", { email });
        return { success: true, message: response.data.message };
    } catch (error) {
        console.error('Forgot password error:', error);
        let message = "Erreur lors de l'envoi du lien";
        
        if (error.response?.data?.message) {
            message = error.response.data.message;
        }
        // Message spécifique pour email non trouvé
        if (error.response?.status === 422) {
            message = "Cet email n'existe pas dans notre système";
        }
        
        return { success: false, message: message };
    }
}

async resetPassword(email, password, passwordConfirmation, token) {
    try {
        const response = await this.axios.post("/reset-password", {
            email: email,
            password: password,
            password_confirmation: passwordConfirmation,
            token: token
        });
        return { success: true, message: response.data.message };
    } catch (error) {
        console.error('Reset password error:', error);
        let message = "Erreur lors de la réinitialisation";
        
        if (error.response?.data?.message) {
            message = error.response.data.message;
        }
        // Token invalide ou expiré
        if (error.response?.status === 422) {
            message = "Ce lien de réinitialisation est invalide ou a expiré";
        }
        
        return { success: false, message: message };
    }
}

    // ==================== PROFIL ====================
   // ==================== PROFIL ====================
async getUser() {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.log('❌ Aucun token trouvé');
            return null;
        }
        
        console.log('✅ Token trouvé, appel API /profil...');
        console.log('Token:', token.substring(0, 30) + '...');
        
        const response = await this.axios.get('/profil', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Réponse reçue:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Erreur getUser:', error.response?.status, error.response?.data);
        
        if (error.response?.status === 401) {
            console.log('Token invalide, suppression...');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
        return null;
    }
}

async getProfile() {
    return this.getUser();  // Réutilise la méthode getUser
}
    async updateProfile(data) {
        try {
            const response = await this.axios.put("/profil", data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur lors de la mise à jour" };
        }
    }

    async changePassword(currentPassword, newPassword, newPasswordConfirmation) {
        try {
            const response = await this.axios.put("/profil/password", {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: newPasswordConfirmation,
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur lors du changement de mot de passe" };
        }
    }

    async getProfileStatus() {
        try {
            const response = await this.axios.get("/profile/status");
            return response.data;
        } catch (error) {
            console.error("Error fetching profile status:", error);
            return null;
        }
    }

    // ==================== LIVRES ====================
    async getBooks(params = {}) {
        try {
            const response = await this.axios.get("/books", { params });
            return { data: response.data.data || [] };
        } catch (error) {
            console.error("Error fetching books:", error);
            return { data: [] };
        }
    }

    async getBook(id) {
        try {
            const response = await this.axios.get(`/books/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching book:", error);
            return null;
        }
    }

    async getGenres() {
        try {
            const response = await this.axios.get("/genres");
            return { data: response.data || [] };
        } catch (error) {
            console.error("Erreur récupération genres:", error);
            return { data: [] };
        }
    }

   async createBook(formData) {
    try {
        const response = await this.axios.post("/books", formData, { 
            headers: { "Content-Type": "multipart/form-data" } 
        });
        return { success: true, data: response.data };
    } catch (error) {
        // Affiche les erreurs de validation pour debug
        console.error('Validation errors:', error.response?.data?.errors);
        return { 
            success: false, 
            message: error.response?.data?.message || "Erreur lors de l'ajout",
            errors: error.response?.data?.errors 
        };
    }
}

    async updateBook(id, formData) {
        try {
            formData.append("_method", "PUT");
            const response = await this.axios.post(`/books/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur lors de la modification" };
        }
    }

    async deleteBook(id) {
        try {
            await this.axios.delete(`/books/${id}`);
            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    // ==================== BIBLIOTHÈQUES ====================
    async getLibraries() {
        try {
            const response = await this.axios.get("/libraries");
            return response.data;
        } catch (error) {
            console.error("Error fetching libraries:", error);
            return [];
        }
    }

    async getLibrary(id) {
        try {
            const response = await this.axios.get(`/libraries/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching library:", error);
            return null;
        }
    }
   async getUserLibraries() {
    try {
       
        const response = await this.axios.get('/user/libraries');
        return response.data;
    } catch (error) {
        console.error('Error fetching user libraries:', error);
        return [];
    }
}

    async getUserJoinedLibraries() {
        try {
            const response = await this.axios.get("/user/libraries");
            return response.data;
        } catch (error) {
            console.error("Error fetching user libraries:", error);
            return [];
        }
    }

    async createLibrary(formData) {
        try {
            const response = await this.axios.post("/libraries", formData, { headers: { "Content-Type": "multipart/form-data" } });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur lors de la création" };
        }
    }

  async updateLibrary(id, formData) {
    try {
        // Si c'est FormData, il faut le traiter différemment
        const response = await this.axios.post(`/libraries/${id}?_method=PUT`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error updating library:', error);
        return { 
            success: false, 
            message: error.response?.data?.message || "Erreur lors de la modification" 
        };
    }
}

    async joinLibrary(libraryId) {
        try {
            const response = await this.axios.post("/libraries/join", { library_id: libraryId });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur lors de l'inscription" };
        }
    }

    async getLibraryInscriptions(libraryId) {
        try {
            const response = await this.axios.get(`/libraries/${libraryId}/inscriptions`);
            return response.data;
        } catch (error) {
            console.error("Error fetching library inscriptions:", error);
            return [];
        }
    }

    async getLibraryLoans(libraryId) {
        try {
            const response = await this.axios.get(`/libraries/${libraryId}/loans`);
            return response.data;
        } catch (error) {
            console.error("Error fetching library loans:", error);
            return [];
        }
    }

    async getLibraryReservations(libraryId) {
        try {
            const response = await this.axios.get(`/libraries/${libraryId}/reservations`);
            return response.data;
        } catch (error) {
            console.error("Error fetching library reservations:", error);
            return { count: 0, reservations: [] };
        }
    }
    async deleteLibrary(id) {
    try {
        const response = await this.axios.delete(`/libraries/${id}`);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error deleting library:', error);
        return { success: false, message: error.response?.data?.message || 'Erreur lors de la suppression' };
    }
}

async getPartnerLibraries() {
    try {
        const response = await this.axios.get('/libraries/partners');
        return response.data;
    } catch (error) {
        console.error('Error fetching partner libraries:', error);
        return [];
    }
}


    // ==================== EMPRUNTS ====================
    async getLoans() {
        try {
            const response = await this.axios.get("/loans");
            return response.data;
        } catch (error) {
            console.error("Error fetching loans:", error);
            return [];
        }
    }

    async borrowBook(bookId) {
        try {
            const response = await this.axios.post("/loans", { book_id: bookId });
            if (response.status === 202 || response.data.reservation) {
                return { success: true, isReservation: true, data: response.data };
            }
            return { success: true, isReservation: false, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur lors de l'emprunt", status: error.response?.status, data: error.response?.data };
        }
    }

     async confirmPickup(loanId) {
    try {
        const response = await this.axios.post(`/loans/${loanId}/confirm-pickup`);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error confirming pickup:', error);
        return { 
            success: false, 
            message: error.response?.data?.message || 'Erreur lors de la confirmation du retrait'
        };
    }
}
async getActiveReservations(libraryId) {
    try {
        const response = await this.axios.get(`/libraries/${libraryId}/active-reservations`);
        return response.data;
    } catch (error) {
        console.error("Error fetching active reservations:", error);
        return { count: 0, reservations: [] };
    }
}
    async returnBook(loanId, conditionOnReturn, additionalPenaltyAmount = null, penaltyReason = null) {
        try {
            const data = { condition_on_return: conditionOnReturn };
            if (additionalPenaltyAmount) {
                data.additional_penalty_amount = additionalPenaltyAmount;
                data.penalty_reason = penaltyReason;
            }
            const response = await this.axios.post(`/loans/${loanId}/return`, data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur lors du retour" };
        }
    }

    // ==================== PÉNALITÉS ====================

// Récupérer les pénalités non payées du lecteur connecté (pour afficher dans Mes cartes)
async getMyUnpaidPenalties() {
    try {
        const response = await this.axios.get('/my-penalties');
        return response.data;
    } catch (error) {
        console.error("Error fetching my unpaid penalties:", error);
        return [];
    }
}

// Récupérer les pénalités d'une bibliothèque (pour admin)
async getPenalties(libraryId = null) {
    try {
        let url = '/penalties';
        if (libraryId) {
            url = `/libraries/${libraryId}/penalties`;
        }
        const response = await this.axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching penalties:", error);
        return [];
    }
}

// Payer une pénalité (pour admin)
async payPenalty(penaltyId) {
    try {
        const response = await this.axios.patch(`/penalties/${penaltyId}/pay`);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || "Erreur lors du paiement" };
    }
}

// Compter les pénalités non payées d'une bibliothèque (pour admin)
async getUnpaidPenaltiesCount(libraryId) {
    try {
        const response = await this.axios.get(`/libraries/${libraryId}/unpaid-penalties-count`);
        return response.data;
    } catch (error) {
        console.error("Error fetching unpaid penalties count:", error);
        return { count: 0 };
    }
}

    // ==================== NOTIFICATIONS ====================
    async getNotifications() {
        try {
            const response = await this.axios.get("/notifications");
            return response.data;
        } catch (error) {
            console.error("Error fetching notifications:", error);
            return [];
        }
    }

    async markNotificationAsRead(notificationId) {
        try {
            const response = await this.axios.patch(`/notifications/${notificationId}/read`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Error marking notification as read:", error);
            return { success: false };
        }
    }

    async markAllNotificationsAsRead() {
        try {
            const response = await this.axios.post("/notifications/read-all");
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            return { success: false };
        }
    }

    // ==================== AVIS ====================
    async getBookReviews(bookId, page = 1) {
        try {
            const response = await this.axios.get(`/books/${bookId}/reviews?page=${page}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching reviews:", error);
            return null;
        }
    }

   async addReview(bookId, data) {
    try {
        const response = await this.axios.post(`/books/${bookId}/reviews`, data);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || "Erreur lors de l'ajout de l'avis" };
    }
}

    async likeReview(reviewId) {
        try {
            const response = await this.axios.post(`/reviews/${reviewId}/like`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false };
        }
    }

    // ==================== FAVORIS ====================
    async getFavorites() {
        try {
            const response = await this.axios.get("/favorites");
            return response.data;
        } catch (error) {
            console.error("Error fetching favorites:", error);
            return [];
        }
    }

    async toggleFavorite(bookId) {
        try {
            const response = await this.axios.post(`/favorites/toggle/${bookId}`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur" };
        }
    }

    async isFavorite(bookId) {
        try {
            const response = await this.axios.get(`/favorites/check/${bookId}`);
            return response.data;
        } catch (error) {
            console.error("Error checking favorite:", error);
            return { is_favorite: false };
        }
    }

    // ==================== CLUBS ====================
    async getClubs() {
        try {
            const response = await this.axios.get("/clubs");
            return response.data;
        } catch (error) {
            console.error("Error fetching clubs:", error);
            return [];
        }
    }

    async getClub(id) {
        try {
            const response = await this.axios.get(`/clubs/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching club:", error);
            return null;
        }
    }

    async createClub(name, description = "") {
        try {
            const response = await this.axios.post("/clubs", { name, description });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur lors de la création" };
        }
    }

    async joinClub(clubId) {
        try {
            const response = await this.axios.post(`/clubs/${clubId}/join`);
            return { success: true, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur lors de l'adhésion" };
        }
    }

    async leaveClub(clubId) {
        try {
            const response = await this.axios.delete(`/clubs/${clubId}/leave`);
            return { success: true, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur" };
        }
    }

    async getClubMessages(clubId) {
        try {
            const response = await this.axios.get(`/clubs/${clubId}/messages`);
            return response.data;
        } catch (error) {
            console.error("Error fetching messages:", error);
            return [];
        }
    }

    async sendClubMessage(clubId, message) {
        try {
            const response = await this.axios.post(`/clubs/${clubId}/messages`, { message });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur" };
        }
    }

    async deleteClub(clubId) {
        try {
            const response = await this.axios.delete(`/clubs/${clubId}`);
            return { success: true, message: response.data.message };
        } catch (error) {
            return { success: false, message: "Erreur lors de la suppression" };
        }
    }

    async deleteMessage(messageId) {
        try {
            const response = await this.axios.delete(`/messages/${messageId}`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur lors de la suppression" };
        }
    }

    // ==================== ÉTAGÈRES ====================
    async getShelves() {
        try {
            const response = await this.axios.get("/shelves");
            return response.data;
        } catch (error) {
            console.error("Error fetching shelves:", error);
            return [];
        }
    }

    async getShelf(id) {
        try {
            const response = await this.axios.get(`/shelves/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching shelf:", error);
            return null;
        }
    }

    async createShelf(formData) {
        try {
            const response = await this.axios.post("/shelves", formData, { headers: { "Content-Type": "multipart/form-data" } });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur lors de la création" };
        }
    }

    async updateShelf(id, formData) {
        try {
            const response = await this.axios.post(`/shelves/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur lors de la modification" };
        }
    }

    async deleteShelf(id) {
        try {
            const response = await this.axios.delete(`/shelves/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur lors de la suppression" };
        }
    }

    async addBookToShelf(shelfId, bookId) {
        try {
            const response = await this.axios.post(`/shelves/${shelfId}/books/${bookId}`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur lors de l'ajout" };
        }
    }

    async removeBookFromShelf(shelfId, bookId) {
        try {
            const response = await this.axios.delete(`/shelves/${shelfId}/books/${bookId}`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Erreur lors du retrait" };
        }
    }
   // ==================== INCIDENTS ====================
async getLibraryIncidents(libraryId = null) {
    try {
        // Ne passe pas libraryId en paramètre d'URL, utilise toujours la même route
        // Le backend filtre déjà par l'utilisateur connecté
        const response = await this.axios.get('/library-incidents');
        return response.data;
    } catch (error) {
        console.error('Error fetching incidents:', error);
        return [];
    }
}
// Récupérer les incidents de l'utilisateur connecté (reader)
async getUserIncidents() {
    try {
        const response = await this.axios.get('/user/incidents');
        return response.data;
    } catch (error) {
        console.error('Error fetching user incidents:', error);
        return [];
    }
}
async resolveIncident(incidentId) {
    try {
        console.log('📤 Résolution incident:', incidentId);
        const response = await this.axios.patch(`/incidents/${incidentId}/resolve`);
        console.log('📥 Réponse:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('❌ Erreur résolution incident:', error);
        return { 
            success: false, 
            message: error.response?.data?.message || "Erreur lors de la résolution"
        };
    }
}
// ==================== RAPPORTS ====================
async getReportsStats(libraryId, period = 'month') {
    try {
        const response = await this.axios.get(`/libraries/${libraryId}/reports/stats`, {
            params: { period }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching reports stats:', error);
        return {
            totalBooks: 0,
            totalCopies: 0,
            available: 0,
            borrowed: 0,
            users: 0,
            reservations: 0,
            lateReturns: 0,
            totalPenalties: 0
        };
    }
}

async getTopBooks(libraryId, limit = 5) {
    try {
        const response = await this.axios.get(`/libraries/${libraryId}/reports/top-books`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching top books:', error);
        return [];
    }
}

async getTopUsers(libraryId, limit = 5) {
    try {
        const response = await this.axios.get(`/libraries/${libraryId}/reports/top-users`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching top users:', error);
        return [];
    }
}

async getGenreDistribution(libraryId) {
    try {
        const response = await this.axios.get(`/libraries/${libraryId}/reports/genre-distribution`);
        return response.data;
    } catch (error) {
        console.error('Error fetching genre distribution:', error);
        return [];
    }
}

async getActivePenalties(libraryId) {
    try {
        const response = await this.axios.get(`/libraries/${libraryId}/reports/active-penalties`);
        return response.data;
    } catch (error) {
        console.error('Error fetching active penalties:', error);
        return [];
    }
}
// --- GESTION DES MEMBRES ---

async getLibraryMembers(libraryId) {
    try {
        const response = await this.axios.get(`/libraries/${libraryId}/members`);
        return response.data;
    } catch (error) {
        console.error("Error fetching library members:", error);
        return [];
    }
}

// AJOUTE CETTE MÉTHODE ICI
async getInternalMembers(libraryId) {
    try {
        const response = await this.axios.get(`/libraries/${libraryId}/members`);
        return response.data;
    } catch (error) {
        console.error('Error fetching internal members:', error);
        return [];
    }
}

// Ajouter un membre interne
async addInternalMember(data) {
    try {
        const response = await this.axios.post(`/libraries/${data.library_id}/members`, {
            email: data.email,
            library_id: data.library_id,
            role_id: data.role_id,
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Add member error:", error.response?.data);
        return {
            success: false,
            message: error.response?.data?.message || "Erreur lors de l'ajout",
        };
    }
}

async removeInternalMember(memberId) {
    try {
        const response = await this.axios.delete(`/internal-members/${memberId}`);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || "Erreur lors de la suppression",
        };
    }
}
// ==================== AUTHENTIFICATION SOCIALE ====================

// Récupérer l'URL de redirection Google
async getGoogleRedirectUrl() {
    try {
        const response = await this.axios.get('/auth/google/redirect');
        return response.data.url;
    } catch (error) {
        console.error('Error getting Google redirect URL:', error);
        return null;
    }
}

// Récupérer l'URL de redirection Facebook
async getFacebookRedirectUrl() {
    try {
        const response = await this.axios.get('/auth/facebook/redirect');
        return response.data.url;
    } catch (error) {
        console.error('Error getting Facebook redirect URL:', error);
        return null;
    }
}
// ==================== GESTION DES EXEMPLAIRES (QR CODE) ====================

// Récupérer tous les exemplaires d'un livre
async getBookCopies(bookId) {
    try {
        const response = await this.axios.get(`/books/${bookId}/copies`);
        return response.data;
    } catch (error) {
        console.error('Error fetching book copies:', error);
        return { copies: [], book: null };
    }
}

// Générer un QR code pour un exemplaire (image)
async getCopyQRCode(copyId) {
    try {
        // Option 1: Si ton backend génère l'image QR
        const response = await this.axios.get(`/copies/${copyId}/qrcode`, {
            responseType: 'blob'  // Important pour télécharger l'image
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching QR code:', error);
        return null;
    }
}

// Télécharger le QR code
downloadQRCode(qrCodeValue, fileName = 'qrcode') {
    // Option 2: Générer côté frontend si tu as juste le texte
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeValue)}`;
    
    // Télécharger l'image
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const link = document.createElement('a');
            const objectUrl = URL.createObjectURL(blob);
            link.href = objectUrl;
            link.download = `${fileName}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(objectUrl);
        })
        .catch(console.error);
}
async scanQRCode(token) {
    try {
        const response = await this.axios.get(`/scan/${token}`);
        return response.data;
    } catch (error) {
        console.error('Error scanning QR code:', error);
        return { 
            success: false, 
            message: error.response?.data?.message || 'Erreur lors du scan du QR code'
        };
    }
}
// ==================== CASIER BIBLIOTHÉCAIRE ====================
async getLibraryRecords() {
    try {
        const response = await this.axios.get('/library-records');
        return response.data;
    } catch (error) {
        console.error('Error fetching library records:', error);
        return { records: [], total: 0 };
    }
}

async createLibraryRecord(data) {
    try {
        console.log('📤 API createLibraryRecord appelée avec:', data);
        const response = await this.axios.post('/library-records', data);
        console.log('📥 Réponse API createLibraryRecord:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('❌ Erreur API createLibraryRecord:', error.response?.data || error);
        return { 
            success: false, 
            message: error.response?.data?.message || "Erreur lors de la création"
        };
    }
}

async resolveLibraryRecord(recordId) {
    try {
        console.log('📤 Résolution signalement:', recordId);
        const response = await this.axios.patch(`/library-records/${recordId}/resolve`);
        console.log('📥 Réponse:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('❌ Erreur:', error.response?.data || error);
        return { 
            success: false, 
            message: error.response?.data?.message || "Erreur lors de la résolution"
        };
    }
}

async getLibraryRecordDetail(recordId) {
    try {
        const response = await this.axios.get(`/library-records/${recordId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching record detail:', error);
        return null;
    }
}
// ==================== CONTESTATIONS ====================

// Récupérer toutes les contestations de l'utilisateur
async getUserContestations() {
    try {
        const response = await this.axios.get('/contestations');
        return response.data;
    } catch (error) {
        console.error('Error fetching contestations:', error);
        return [];
    }
}

// Créer une contestation
async createContestation(incidentId, message, justification = null) {
    try {
        const response = await this.axios.post('/contestations', {
            incident_id: incidentId,
            message: message,
            justification: justification
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { 
            success: false, 
            message: error.response?.data?.message || 'Erreur lors de la création'
        };
    }
}

// Voir une contestation spécifique
async getContestation(id) {
    try {
        const response = await this.axios.get(`/contestations/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching contestation:', error);
        return null;
    }
}

// Récupérer les contestations d'une bibliothèque (pour bibliothécaire)
async getLibraryContestations(status = null) {
    try {
        const url = status ? `/contestations-library?status=${status}` : '/contestations-library';
        const response = await this.axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching library contestations:', error);
        return { data: [] };
    }
}

// Traiter une contestation (bibliothécaire)
async processContestation(contestationId, decision, responseMessage = null) {
    try {
        const response = await this.axios.post(`/contestations-process/${contestationId}`, {
            decision: decision,
            response_message: responseMessage
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { 
            success: false, 
            message: error.response?.data?.message || 'Erreur lors du traitement'
        };
    }
}

// Statistiques des contestations
async getContestationStats() {
    try {
        const response = await this.axios.get('/contestations-library-stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching contestation stats:', error);
        return { total: 0, en_attente: 0, acceptees: 0, rejetees: 0 };
    }
}
// ==================== PAIEMENTS KKiaPay ====================

// Créer un paiement pour une pénalité
async createPaymentForPenalty(penaltyId) {
    try {
        const response = await this.axios.post('/payments/create-for-penalty', { penalty_id: penaltyId });
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error creating payment:', error);
        return { 
            success: false, 
            message: error.response?.data?.message || 'Erreur lors de la création du paiement'
        };
    }
}

// Vérifier une transaction
async verifyPayment(transactionId) {
    try {
        const response = await this.axios.get(`/payments/verify?transaction_id=${transactionId}`);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error verifying payment:', error);
        return { 
            success: false, 
            message: error.response?.data?.message || 'Erreur lors de la vérification'
        };
    }
}

// Récupérer les transactions de l'utilisateur
async getUserTransactions() {
    try {
        const response = await this.axios.get('/payments/my-transactions');
        return response.data;
    } catch (error) {
        console.error('Error fetching user transactions:', error);
        return [];
    }
}
}

export default new ApiService();