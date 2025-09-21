"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    studyLevel: '',
    dailyStudyGoal: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Check password strength in real-time
    if (name === 'password') {
      checkPasswordStrength(value);
    }
    
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const checkPasswordStrength = (password: string) => {
    if (password.length === 0) {
      setPasswordStrength('');
      return;
    }

    // Check password criteria
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    const strengthPoints = [
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isLongEnough
    ].filter(Boolean).length;

    switch (strengthPoints) {
      case 5:
        setPasswordStrength('strong');
        break;
      case 4:
        setPasswordStrength('medium');
        break;
      case 3:
        setPasswordStrength('weak');
        break;
      default:
        setPasswordStrength('very-weak');
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'strong':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'weak':
        return 'bg-orange-500';
      case 'very-weak':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'strong':
        return 'Strong password';
      case 'medium':
        return 'Medium strength';
      case 'weak':
        return 'Weak password';
      case 'very-weak':
        return 'Very weak password';
      default:
        return '';
    }
  };

  const validateForm = () => {
    // Email validation
    if (!formData.email.trim()) {
      setErrorMessage('Please enter your email.');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    
    // Username validation
    if (!formData.username.trim()) {
      setErrorMessage('Please enter your username.');
      return false;
    }
    
    if (formData.username.length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      return false;
    }
    
    // Password validation
    if (!formData.password) {
      setErrorMessage('Please enter your password.');
      return false;
    }
    
    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return false;
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setErrorMessage('Password must include uppercase, lowercase, number, and special character.');
      return false;
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      setErrorMessage('Please confirm your password.');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords don't match!");
      return false;
    }
    
    // Study level validation
    if (!formData.studyLevel) {
      setErrorMessage('Please select your study level.');
      return false;
    }
    
    // Daily study goal validation
    if (!formData.dailyStudyGoal) {
      setErrorMessage('Please select your daily study goal.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          studyLevel: formData.studyLevel,
          dailyStudyGoal: formData.dailyStudyGoal,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Registration successful!');
        setFormData({
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          studyLevel: '',
          dailyStudyGoal: ''
        });
        setPasswordStrength('');
      } else {
        // Handle specific registration errors
        let errorMsg = 'Registration failed. Please try again.';
        
        if (result.message) {
          const message = result.message.toLowerCase();
          
          if (message.includes('email') || message.includes('already exists') || message.includes('duplicate')) {
            errorMsg = 'This email is already registered.';
          } else if (message.includes('username') || message.includes('taken')) {
            errorMsg = 'This username is already taken.';
          } else {
            errorMsg = result.message;
          }
        }
        
        setErrorMessage(errorMsg);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen flex flex-col md:flex-row font-sans bg-[#3d312e] overflow-x-hidden">
      {/* Left Panel - Hidden on mobile and tablet */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-10 md:p-16 bg-[#f0eeee]">
        <Image
          src="/transparentLogo.png"
          alt="StudyFlow Logo"
          width={300}
          height={90}
          className="object-contain"
        />
        <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-[#3d312e] text-center">
          Welcome to Your Study Hub
        </h1>
        <p className="text-[#948585] mb-4 md:mb-6 text-center">Optimize your learning routine with us</p>
      </div>

      {/* Right Panel - Form */}
<div className="w-full lg:w-1/2 flex justify-center items-center px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:p-12 bg-[#3d312e] 
  min-h-screen lg:min-h-0">
        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 md:p-8 w-full max-w-md">
          {/* Logo for mobile and tablet */}
          <div className="lg:hidden flex justify-center mb-4 sm:mb-5 md:mb-6">
            <Image
              src="/transparentLogo.png"
              alt="StudyFlow Logo"
              width={180}
              height={54}
              className="object-contain"
            />
          </div>
          
          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 md:mb-6 text-[#3d312e] text-center">Register</h2>

            {errorMessage && (
              <div className="mb-3 sm:mb-4 p-3 rounded text-center text-sm bg-red-100 text-red-800 border border-red-200">
                {errorMessage}
              </div>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 mb-3 sm:mb-4 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#3d312e] placeholder-gray-400 text-gray-700 text-sm sm:text-base"
              disabled={isLoading}
            />

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full p-3 mb-3 sm:mb-4 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#3d312e] placeholder-gray-400 text-gray-700 text-sm sm:text-base"
              disabled={isLoading}
            />

            <div className="mb-3 sm:mb-4">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-3 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#3d312e] placeholder-gray-400 text-gray-700 text-sm sm:text-base"
                disabled={isLoading}
              />
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center mb-1">
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getPasswordStrengthColor()} transition-all duration-300`}
                        style={{ width: 
                          passwordStrength === 'very-weak' ? '25%' :
                          passwordStrength === 'weak' ? '50%' :
                          passwordStrength === 'medium' ? '75%' :
                          passwordStrength === 'strong' ? '100%' : '0%'
                        }}
                      ></div>
                    </div>
                  </div>
                  <p className={`text-xs ${passwordStrength === 'strong' ? 'text-green-600' : passwordStrength === 'medium' ? 'text-yellow-600' : passwordStrength === 'weak' ? 'text-orange-600' : 'text-red-600'}`}>
                    {getPasswordStrengthText()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Must include: uppercase, lowercase, number, special character, and be at least 8 characters long.
                  </p>
                </div>
              )}
            </div>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full p-3 mb-3 sm:mb-4 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#3d312e] placeholder-gray-400 text-gray-700 text-sm sm:text-base"
              disabled={isLoading}
            />

            <select
              name="studyLevel"
              value={formData.studyLevel}
              onChange={handleChange}
              required
              className="w-full p-3 mb-3 sm:mb-4 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#3d312e] text-gray-700 text-sm sm:text-base"
              disabled={isLoading}
            >
              <option value="">Select Study Level</option>
              <option value="high_school">High School</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="graduate">Graduate</option>
            </select>

            <select
              name="dailyStudyGoal"
              value={formData.dailyStudyGoal}
              onChange={handleChange}
              required
              className="w-full p-3 mb-4 sm:mb-5 md:mb-6 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#3d312e] text-gray-700 text-sm sm:text-base"
              disabled={isLoading}
            >
              <option value="">Select Daily Study Goal</option>
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="4">4 hours</option>
              <option value="5">5+ hours</option>
            </select>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#3d312e] text-white py-3 rounded hover:bg-[#4a3c38] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>

            <p className="text-center mt-4 sm:mt-5 md:mt-6 text-gray-600 text-xs sm:text-sm">
              Already have an account?{' '}
              <a href="/login" className="text-[#3d312e] hover:underline">
                Log In
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}