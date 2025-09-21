'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownEndTime, setCooldownEndTime] = useState<Date | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // --- Helpers ---
  const parseLoginError = (data: any, res?: Response) => {
    const raw = (data?.message || '').toLowerCase();

    if (data?.field === 'username') return 'Incorrect username';
    if (data?.field === 'password') return 'Incorrect password';

    if (raw.includes('username') || raw.includes('user') || raw.includes('account') || raw.includes('not found')) {
      return 'Incorrect username';
    }
    if (raw.includes('password') || raw.includes('invalid password') || raw.includes('wrong password')) {
      return 'Incorrect password';
    }
    if (raw.includes('credential') || raw.includes('credentials') || raw.includes('incorrect')) {
      return 'Incorrect username or password';
    }

    if (res && !res.ok) return 'Incorrect username or password';
    return data?.message || 'Login failed';
  };

  const incrementFailedAttempts = () => {
    const current = parseInt(localStorage.getItem('loginFailedAttempts') || '0', 10);
    const next = current + 1;
    localStorage.setItem('loginFailedAttempts', next.toString());
    setFailedAttempts(next);
    return next;
  };

  // Load stored attempts/cooldown
  useEffect(() => {
    const storedAttempts = localStorage.getItem('loginFailedAttempts');
    const storedCooldown = localStorage.getItem('loginCooldownEndTime');

    if (storedAttempts) {
      setFailedAttempts(parseInt(storedAttempts));
    }

    if (storedCooldown) {
      const endTime = new Date(parseInt(storedCooldown));
      if (endTime > new Date()) {
        setCooldownEndTime(endTime);
      } else {
        localStorage.removeItem('loginCooldownEndTime');
        localStorage.removeItem('loginFailedAttempts');
      }
    }
  }, []);

  // Cooldown countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (cooldownEndTime) {
      interval = setInterval(() => {
        const now = new Date();
        const timeRemaining = Math.max(0, cooldownEndTime.getTime() - now.getTime());
        setRemainingTime(Math.ceil(timeRemaining / 1000));

        if (timeRemaining <= 0) {
          clearInterval(interval);
          setCooldownEndTime(null);
          setFailedAttempts(0);
          setErrorMessage('');
          localStorage.removeItem('loginCooldownEndTime');
          localStorage.removeItem('loginFailedAttempts');
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownEndTime]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cooldownEndTime && new Date() < cooldownEndTime) {
      setErrorMessage(`Please wait ${Math.ceil(remainingTime / 60)} minutes before trying again.`);
      return;
    }

    if (!formData.username.trim() && !formData.password) {
      setErrorMessage('Please enter your username and password.');
      return;
    }
    if (!formData.username.trim()) {
      setErrorMessage('Please enter your username.');
      return;
    }
    if (!formData.password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await res.json();

      if (res.ok && data?.success) {
        setFailedAttempts(0);
        localStorage.removeItem('loginFailedAttempts');
        localStorage.removeItem('loginCooldownEndTime');
        setErrorMessage('');
        window.location.href = '/';
        return;
      }

      const newAttempts = incrementFailedAttempts();
      const specificError = parseLoginError(data, res);
      const attemptsRemaining = Math.max(0, 3 - newAttempts);

      if (attemptsRemaining > 0) {
        setErrorMessage(`${specificError}. ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining.`);
      } else {
        setErrorMessage(`${specificError}. No attempts remaining.`);
      }

      if (newAttempts >= 3) {
        const endTime = new Date(Date.now() + 3 * 60 * 1000);
        setCooldownEndTime(endTime);
        setErrorMessage('Too many failed attempts. Please wait 3 minutes before trying again.');
        localStorage.setItem('loginCooldownEndTime', endTime.getTime().toString());
      }
    } catch (err) {
      console.error('Login error:', err);

      const newAttempts = incrementFailedAttempts();
      const attemptsRemaining = Math.max(0, 3 - newAttempts);

      if (attemptsRemaining > 0) {
        setErrorMessage(`Network error. Please try again. ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining.`);
      } else {
        setErrorMessage('Network error. No attempts remaining.');
      }

      if (newAttempts >= 3) {
        const endTime = new Date(Date.now() + 3 * 60 * 1000);
        setCooldownEndTime(endTime);
        setErrorMessage('Too many failed attempts. Please wait 3 minutes before trying again.');
        localStorage.setItem('loginCooldownEndTime', endTime.getTime().toString());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const isCooldownActive = () => {
    return cooldownEndTime !== null && new Date() < cooldownEndTime;
  };

  return (
    <div className="w-screen min-h-screen flex flex-col justify-center md:flex-row font-sans bg-[#3d312e] overflow-x-hidden">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-10 md:p-16 bg-[#f0eeee]">
        <div className="flex items-center mb-8">
          <Image 
            src="/transparentLogo.png"
            alt="StudyFlow Logo"
            width={300}
            height={90}
            className="object-contain"
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-[#3d312e] text-center">Welcome to Your Study Hub</h1>
        <p className="text-[#948585] mb-6 text-center">Optimize your learning routine with us</p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-4 sm:py-6 md:py-8 lg:p-12 bg-[#3d312e]">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 md:p-6 w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-4 sm:mb-5">
            <Image 
              src="/transparentLogo.png"
              alt="StudyFlow Logo"
              width={160}
              height={48}
              className="object-contain"
            />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-[#3d312e]">Log in</h2>
              <p className="text-sm text-[#948585] mt-2">
                Please enter your credentials. <br />
                Won't be shared publicly.
              </p>
            </div>

            {errorMessage && (
              <div className={`p-3 rounded text-center text-sm ${
                isCooldownActive()
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                  : errorMessage.includes('Please enter your') 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {errorMessage}
                {isCooldownActive() && (
                  <div className="mt-1 font-medium text-xs">Time remaining: {formatTime(remainingTime)}</div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-3 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#3d312e] placeholder-gray-400 text-gray-700 text-sm sm:text-base"
                required
                disabled={isLoading || isCooldownActive()}
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#3d312e] placeholder-gray-400 text-gray-700 text-sm sm:text-base"
                required
                disabled={isLoading || isCooldownActive()}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || isCooldownActive()}
              className="w-full bg-[#3d312e] text-white py-3 rounded hover:bg-[#4a3c38] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>

            <p className="text-center text-gray-600 text-xs sm:text-sm">
              Don't have an account?{' '}
              <a href="/register" className="text-[#3d312e] hover:underline">Register</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
