import axios from 'axios';

class ApiService {
  constructor() {
    this.baseURL = '/api';
    this.axios = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    this.axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
  async register(email, password, passwordConfirmation) {
    try {
      const response = await this.axios.post('/register', {
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur d\'inscription' 
      };
    }
  }

  // Étape 2: Vérification OTP
  async verifyOtp(email, otp) {
    try {
      const response = await this.axios.post('/verify-otp', { email, otp });
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Code incorrect' 
      };
    }
  }
  async resendOtp(email) {
    try {
      const response = await this.axios.post('/resend-otp', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur d\'envoi' 
      };
    }
  }
  async login(email, password) {
    try {
      const response = await this.axios.post('/login', { email, password });
      const { access_token, user } = response.data;
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Identifiants incorrects' 
      };
    }
  }

  // Déconnexion
  async logout() {
    try {
      await this.axios.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  // Compléter le profil (nom, téléphone, identité)
  async completeProfile(name, tel, identityHash) {
  try {
    const response = await this.axios.post('/profil/complete', {  
      name,
      tel,
      identity_hash: identityHash
    });
    const user = response.data.user;
    localStorage.setItem('user', JSON.stringify(user));
    return { success: true, user };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Erreur de mise à jour' 
    };
  }
}
// Mot de passe oublié - Envoyer le lien de réinitialisation
async forgotPassword(email) {
  try {
    const response = await this.axios.post('/forgot-password', { email });
    return { success: true, message: response.data.message };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Erreur lors de l\'envoi du lien'
    };
  }
}

// Réinitialiser le mot de passe
async resetPassword(email, password, passwordConfirmation, token) {
  try {
    const response = await this.axios.post('/reset-password', {
      email,
      password,
      password_confirmation: passwordConfirmation,
      token
    });
    return { success: true, message: response.data.message };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Erreur lors de la réinitialisation'
    };
  }
}

  // Récupérer l'utilisateur connecté
  async getUser() {
    try {
      const response = await this.axios.get('/user');
      return response.data;
    } catch (error) {
      return null;
    }
  }

async getBooks(params = {}) {
  try {
    const response = await this.axios.get('/books', { params });
    return { data: response.data.data || [] };
  } catch (error) {
    console.error('Error fetching books:', error);
    return { data: [] };
  }
}
async getGenres() {
  try {
    const response = await this.axios.get('/genres'); // Appelle ton endpoint /genres
    return { data: response.data || [] }; // Retourne les données
  } catch (error) {
    console.error('Erreur récupération genres:', error);
    return { data: [] };
  }
}

async createBook(formData) {
  try {
    const response = await this.axios.post('/books', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Create book error:', error.response?.data);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Erreur lors de l\'ajout' 
    };
  }
}

async updateBook(id, formData) {
  try {
    formData.append('_method', 'PUT');
    const response = await this.axios.post(`/books/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Erreur lors de la modification' 
    };
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

  async getBook(id) {
    try {
      const response = await this.axios.get(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching book:', error);
      return null;
    }
  }

  async getProfileStatus() {
    try {
      const response = await this.axios.get('/profile/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile status:', error);
      return null;
    }
  }
  async getLibraries() {
    try {
      const response = await this.axios.get('/libraries');
      return response.data;
    } catch (error) {
      console.error('Error fetching libraries:', error);
      return [];
    }
  }
async getLibrary(id) {
  try {
    const response = await this.axios.get(`/libraries/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching library:', error);
    return null;
  }
}
// Récupérer les bibliothèques que l'utilisateur a rejointes
async getUserJoinedLibraries() {
  try {
    const response = await this.axios.get('/user/libraries');
    return response.data;
  } catch (error) {
    console.error('Error fetching user libraries:', error);
    return [];
  }
}

async updateLibrary(id, formData) {
  try {

    const response = await this.axios.put(`/libraries/${id}`, {
      loan_duration: parseInt(formData.get('loan_duration')),
      daily_penalty_amount: parseFloat(formData.get('daily_penalty_amount'))
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Update library error:', error.response?.data);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Erreur lors de la modification' 
    };
  }
}
  async getLibraryMembers(libraryId) {
  try {
    // Essaie d'abord via les membres internes
    const response = await this.axios.get(`/libraries/${libraryId}/members`);
    return response.data;
  } catch (error) {
    console.error('Error fetching library members:', error);
    return [];
  }
}
async createLibrary(formData) {
  try {
    const response = await this.axios.post('/libraries', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Erreur lors de la création' 
    };
  }
}

async getUserLibraries() {
  try {
    const response = await this.axios.get('/libraries');
    console.log('Réponse API /libraries:', response.data);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    console.error('Erreur détaillée:', error.response?.data);
    
    // Fallback vers localStorage
    const savedLibrary = localStorage.getItem('user_library');
    if (savedLibrary) {
      return [JSON.parse(savedLibrary)];
    }
    return [];
  }
}
async joinLibrary(libraryId) {
  try {
    const response = await this.axios.post('/libraries/join', {
      library_id: libraryId
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Erreur lors de l\'inscription' 
    };
  }
}
// Vérifier si l'utilisateur a rejoint une bibliothèque
async checkIfJoinedLibrary(libraryId) {
  try {
    const response = await this.axios.get(`/libraries/${libraryId}/check-join`);
    return response.data;
  } catch (error) {
    console.error('Error checking join status:', error);
    return { joined: false };
  }
}

// Récupérer les membres internes d'une bibliothèque
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
      role_id: data.role_id
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Add member error:', error.response?.data);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Erreur lors de l\'ajout' 
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
      message: error.response?.data?.message || 'Erreur lors de la suppression' 
    };
  }
}

// Récupérer tous les emprunts de l'utilisateur connecté
async getLoans() {
  try {
    const response = await this.axios.get('/loans');
    return response.data;
  } catch (error) {
    console.error('Error fetching loans:', error);
    return [];
  }
}

// Emprunter un livre
async borrowBook(bookId) {
  try {
    const response = await this.axios.post('/loans', { book_id: bookId });
    
    // Vérifier si la réponse contient une réservation (status 202)
    if (response.status === 202 || response.data.reservation) {
      return { 
        success: true, 
        isReservation: true,
        data: response.data 
      };
    }
    
    // Emprunt réussi (status 201)
    return { 
      success: true, 
      isReservation: false,
      data: response.data 
    };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Erreur lors de l\'emprunt',
      status: error.response?.status,
      data: error.response?.data
    };
  }
}
// Récupérer les membres (inscriptions) d'une bibliothèque
async getLibraryInscriptions(libraryId) {
  try {
    const response = await this.axios.get(`/libraries/${libraryId}/inscriptions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching library inscriptions:', error);
    return [];
  }
}

// Retourner un livre
async returnBook(loanId, conditionOnReturn) {
  try {
    const response = await this.axios.post(`/loans/${loanId}/return`, { 
      condition_on_return: conditionOnReturn 
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Erreur lors du retour' 
    };
  }
}

// Récupérer tous les emprunts de la bibliothèque (pour admin)
async getLibraryLoans(libraryId) {
  try {
    const response = await this.axios.get(`/libraries/${libraryId}/loans`);
    return response.data;
  } catch (error) {
    console.error('Error fetching library loans:', error);
    return [];
  }
}

// Récupérer toutes les réservations de la bibliothèque
async getLibraryReservations(libraryId) {
  try {
    const response = await this.axios.get(`/libraries/${libraryId}/reservations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching library reservations:', error);
    return { count: 0, reservations: [] };
  }
}

// Retourner un livre (appel à la route existante)
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
    return { 
      success: false, 
      message: error.response?.data?.message || 'Erreur lors du retour'
    };
  }
}

// Mettre à jour un prêt (avec pénalité)
async updateLoan(loanId, amount, reason) {
  try {
    const response = await this.axios.put(`/loans/${loanId}`, { 
      amount, 
      reason 
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Erreur lors de la mise à jour' 
    };
  }
}

// Récupérer toutes les notifications de l'utilisateur
async getNotifications() {
  try {
    const response = await this.axios.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

// Marquer une notification comme lue
async markNotificationAsRead(notificationId) {
  try {
    const response = await this.axios.patch(`/notifications/${notificationId}/read`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false };
  }
}

// Marquer toutes les notifications comme lues
async markAllNotificationsAsRead() {
  try {
    const response = await this.axios.post('/notifications/read-all');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false };
  }
}
// Récupérer les avis d'un livre
async getBookReviews(bookId, page = 1) {
  try {
    const response = await this.axios.get(`/books/${bookId}/reviews?page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return null;
  }
}

// Ajouter / modifier un avis
async addReview(bookId, data) {
  try {
    const response = await this.axios.post(`/books/${bookId}/reviews`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Erreur lors de l'ajout de l'avis"
    };
  }
}

// Liker un avis
async likeReview(reviewId) {
  try {
    const response = await this.axios.post(`/reviews/${reviewId}/like`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false };
  }
}
// Récupérer toutes les pénalités
async getPenalties() {
  try {
    const response = await this.axios.get('/penalties');
    return response.data;
  } catch (error) {
    console.error('Error fetching penalties:', error);
    return [];
  }
}

// Payer une pénalité
async payPenalty(penaltyId) {
  try {
    const response = await this.axios.patch(`/penalties/${penaltyId}/pay`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Erreur lors du paiement'
    };
  }
}
// Récupérer le nombre de pénalités non payées pour les retards
async getUnpaidPenaltiesCount(libraryId) {
  try {
    const response = await this.axios.get(`/libraries/${libraryId}/unpaid-penalties-count`);
    return response.data;
  } catch (error) {
    console.error('Error fetching unpaid penalties count:', error);
    return { count: 0 };
  }
}
}



export default new ApiService();