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

    // Interceptor pour ajouter le token
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

    // Interceptor pour gérer les erreurs 401
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

  // Renvoyer OTP
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

  // Connexion
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
      const response = await this.axios.post('/completeProfile', {
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
      return response.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      return [];
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
    // Essaie d'abord l'API
    const response = await this.axios.get('/libraries');
    return response.data;
  } catch (error) {
    console.error('API error, using fallback data');
    // Fallback : retourner des données mockées depuis localStorage
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
  async getLoans() {
    try {
      const response = await this.axios.get('/loans');
      return response.data;
    } catch (error) {
      console.error('Error fetching loans:', error);
      return [];
    }
  }
}

export default new ApiService();