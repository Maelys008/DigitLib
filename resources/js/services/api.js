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