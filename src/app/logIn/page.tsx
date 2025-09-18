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

  // Check for existing failed attempts and cooldown on component mount
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
        // Clear expired cooldown
        localStorage.removeItem('loginCooldownEndTime');
        localStorage.removeItem('loginFailedAttempts');
      }
    }
  }, []);

  // Countdown timer for cooldown period
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
    
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is in cooldown period
    if (cooldownEndTime && new Date() < cooldownEndTime) {
      setErrorMessage(`Please wait ${Math.ceil(remainingTime / 60)} minutes before trying again.`);
      return;
    }
    
    // Basic validation - check if fields are empty
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Reset failed attempts on successful login
        setFailedAttempts(0);
        setErrorMessage('');
        localStorage.removeItem('loginFailedAttempts');
        localStorage.removeItem('loginCooldownEndTime');
        
        // Redirect to root page, middleware will handle the final redirection
        window.location.href = '/';
      } else {
        // Increment failed attempts
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        localStorage.setItem('loginFailedAttempts', newAttempts.toString());
        
        // Determine the specific error
        let specificError = 'Login failed';
        
        // Check if the API response indicates which field is wrong
        if (data.message) {
          const message = data.message.toLowerCase();
          
          if (message.includes('user') || message.includes('username') || message.includes('account') || message.includes('not found')) {
            specificError = 'Incorrect username';
          } else if (message.includes('password') || message.includes('invalid credential') || message.includes('incorrect')) {
            specificError = 'Incorrect password';
          } else {
            specificError = data.message;
          }
        }
        
        // Show specific error message with attempts remaining
        const attemptsRemaining = 3 - newAttempts;
        if (attemptsRemaining > 0) {
          setErrorMessage(`${specificError}. ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining.`);
        } else {
          setErrorMessage(`${specificError}. No attempts remaining.`);
        }
        
        if (newAttempts >= 3) {
          // Set cooldown period of 3 minutes
          const endTime = new Date(Date.now() + 3 * 60 * 1000);
          setCooldownEndTime(endTime);
          setErrorMessage('Too many failed attempts. Please wait 3 minutes before trying again.');
          localStorage.setItem('loginCooldownEndTime', endTime.getTime().toString());
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem('loginFailedAttempts', newAttempts.toString());
      
      const attemptsRemaining = 3 - newAttempts;
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

  // Format remaining time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Helper function to check if cooldown is active
  const isCooldownActive = () => {
    return cooldownEndTime !== null && new Date() < cooldownEndTime;
  };

  return (
    <div className="w-screen min-h-screen flex flex-col md:flex-row font-sans bg-[#3d312e] overflow-x-hidden">
      {/* Left Panel - Branding */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-10 md:p-16 bg-[#f0eeee]">
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

      {/* Right Panel - Form */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-8 md:p-12 bg-[#3d312e]">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-10 w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <h2 className="text-3xl font-bold mb-6 text-[#3d312e] text-center">Log in</h2>
            <p className="mb-6 text-sm text-[#948585] text-center">
              Please enter your credentials. <br />
              Won't be shared publicly.
            </p>

            {errorMessage && (
              <div className={`mb-4 p-3 rounded text-center text-sm ${
                isCooldownActive()
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                  : errorMessage.includes('Please enter your') 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {errorMessage}
                {isCooldownActive() && (
                  <div className="mt-2 font-medium">Time remaining: {formatTime(remainingTime)}</div>
                )}
              </div>
            )}

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 mb-4 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#3d312e] placeholder-gray-400 text-gray-700"
              required
              disabled={isLoading || isCooldownActive()}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 mb-6 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#3d312e] placeholder-gray-400 text-gray-700"
              required
              disabled={isLoading || isCooldownActive()}
            />

            <button
              type="submit"
              disabled={isLoading || isCooldownActive()}
              className="w-full bg-[#3d312e] text-white py-3 rounded hover:bg-[#4a3c38] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>

            <p className="text-center mt-6 text-gray-600 text-sm">
              Don't have an account?{' '}
              <a href="/register" className="text-[#3d312e] hover:underline">Register</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}