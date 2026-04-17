import MobileLayout from '@/Layouts/MobileLayout';
import { useState } from 'react';
import { ArrowLeft, Lock, Eye, EyeOff, Save } from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../services/api';

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccess('');

    try {
      const result = await api.changePassword(
        formData.current_password,
        formData.password,
        formData.password_confirmation
      );

      if (result.success) {
        setSuccess('Mot de passe modifié avec succès !');
        setFormData({
          current_password: '',
          password: '',
          password_confirmation: ''
        });
        setTimeout(() => {
          router.visit('/profile');
        }, 2000);
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: 'Erreur lors du changement de mot de passe' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileLayout>
      <div className="px-6 py-4">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.visit('/profile/edit')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Changer le mot de passe</h1>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm">
            {success}
          </div>
        )}

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mot de passe actuel
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5 text-gray-400 dark:text-gray-500" /> : <Eye className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type={showNewPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5 text-gray-400 dark:text-gray-500" /> : <Eye className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Minimum 8 caractères</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-400 dark:text-gray-500" /> : <Eye className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white font-semibold py-4 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mt-6 disabled:bg-gray-400 dark:disabled:bg-gray-600"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isLoading ? 'Changement...' : 'Changer le mot de passe'}
          </button>
        </form>
      </div>
    </MobileLayout>
  );
}