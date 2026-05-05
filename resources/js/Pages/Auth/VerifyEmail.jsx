import { useState } from 'react';
import { Mail, LogOut, RefreshCw } from 'lucide-react';
import { router, Link, useForm } from '@inertiajs/react';
import logo from '../../../images/logo .png';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});
    const [isResending, setIsResending] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        setIsResending(true);
        post(route('verification.send'), {
            onFinish: () => {
                setTimeout(() => setIsResending(false), 2000);
            }
        });
    };

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
            <div className="flex-1 flex flex-col justify-center px-6 py-12">
                {/* Logo et Titre */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
                        <img src={logo} alt="DigiLib Logo" className="w-14 h-14 object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Vérifiez votre email
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Confirmez votre adresse email pour continuer
                    </p>
                </div>

                {/* Message d'information */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            Merci de vous être inscrit ! Avant de commencer, veuillez vérifier votre adresse email 
                            en cliquant sur le lien que nous venons de vous envoyer.
                        </p>
                    </div>
                </div>

                {/* Message de succès */}
                {status === 'verification-link-sent' && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-sm text-green-700 dark:text-green-300">
                                Un nouveau lien de vérification a été envoyé à votre adresse email.
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <button
                        type="submit"
                        disabled={processing || isResending}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
                    >
                        {isResending ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Envoi en cours...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-5 h-5" />
                                Renvoyer l'email de vérification
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Se déconnecter
                    </button>
                </form>

                {/* Astuce */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        Vous ne trouvez pas l'email ? Vérifiez vos spams ou 
                        <button 
                            onClick={() => window.location.reload()}
                            className="text-orange-600 dark:text-orange-400 ml-1 hover:underline"
                        >
                            rafraîchissez la page
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}