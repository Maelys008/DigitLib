import { useState, useEffect, useRef } from 'react';
import { Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../../services/api';
import logo from '../../../images/logo .png';

export default function VerifyOtp() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(120);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  
  const email = localStorage.getItem('tempEmail') || '';

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      const digits = value.slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Code à 6 chiffres requis');
      return;
    }
    
    setIsLoading(true);
    
    const result = await api.verifyOtp(email, otpCode);
    
    setIsLoading(false);
    
    if (result.success) {
      // Nettoyer
      localStorage.removeItem('tempEmail');
      router.visit('/complete-profile');
    } else {
      setError(result.message);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    const result = await api.resendOtp(email);
    setIsLoading(false);
    
    if (result.success) {
      setTimer(120);
      setOtp(['', '', '', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();
    } else {
      setError(result.message);
    }
  };

  const handleBack = () => {
    router.visit('/register');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <div className="flex items-center px-6 pt-6">
        <button onClick={handleBack} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-20">
        {/* Logo et Titre */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
            <img src={logo} alt="DigiLib Logo" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Code de vérification</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Nous avons envoyé un code à 6 chiffres à
          </p>
          <p className="text-orange-600 dark:text-orange-400 font-semibold mt-1">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            ))}
          </div>

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Code expire dans <span className="font-semibold text-orange-600 dark:text-orange-400">{formatTime(timer)}</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="text-sm text-orange-600 dark:text-orange-400 font-semibold hover:underline"
              >
                Renvoyer le code
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-orange-500/30"
          >
            {isLoading ? 'Vérification...' : 'Vérifier'}
          </button>
        </form>
      </div>
    </div>
  );
}