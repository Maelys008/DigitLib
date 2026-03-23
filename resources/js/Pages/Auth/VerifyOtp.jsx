import { useState, useEffect, useRef } from 'react';
import { Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function VerifyOtp() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(120);
  const inputRefs = useRef([]);

  const generatedOtp = '123456'; 

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Code à 6 chiffres requis');
      return;
    }
    
    if (otpCode !== generatedOtp) {
      setError('Code incorrect');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      return;
    }
    
    // Récupérer les données utilisateur
    const userData = JSON.parse(localStorage.getItem('tempUser') || '{}');
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.removeItem('tempUser');
    
    router.visit('/');
  };

  const handleResend = () => {
    setTimer(120);
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
  };

  const handleBack = () => {
    router.visit('/register/verify');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center px-6 pt-6">
        <button onClick={handleBack} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-20">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Code de vérification</h1>
          <p className="text-gray-500 text-sm">
            Nous avons envoyé un code à 6 chiffres au
          </p>
          <p className="text-black font-semibold mt-1">+229 XX XX XX XX XX</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2">
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
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-gray-50"
              />
            ))}
          </div>

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-sm text-gray-500">
                Code expire dans <span className="font-semibold text-black">{formatTime(timer)}</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-sm text-black font-semibold"
              >
                Renvoyer le code
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white font-semibold py-4 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Vérifier
          </button>
        </form>
      </div>
    </div>
  );
}