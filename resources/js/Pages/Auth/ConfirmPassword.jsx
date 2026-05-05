import { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { router, useForm } from '@inertiajs/react';
import logo from '../../../images/logo .png';

export default function ConfirmPassword() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    const handleBack = () => {
        router.visit('/');
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
            {/* Bouton retour en haut à gauche */}
            <div className="flex justify-start px-6 pt-6">
                <button 
                    onClick={handleBack}
                    className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
            </div>

            <div className="flex-1 flex flex-col justify-center px-6 pb-20">
                {/* Logo et Titre */}
                <div className="mb-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
                        <img src={logo} alt="DigiLib Logo" className="w-14 h-14 object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Confirmation requise
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Veuillez confirmer votre mot de passe pour continuer
                    </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-800 dark:text-blue-300 text-center">
                        Cette zone sécurisée nécessite une vérification de votre identité
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={data.password}
                                autoFocus
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Votre mot de passe"
                                className="w-full pl-12 pr-12 py-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                ) : (
                                    <Eye className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-orange-500/30"
                    >
                        {processing ? 'Vérification...' : 'Confirmer'}
                    </button>
                </form>
            </div>
        </div>
    );
}