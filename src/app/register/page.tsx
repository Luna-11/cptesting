"use client";
import { useState } from 'react';
import { FaBook } from 'react-icons/fa';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    console.log('Registering:', formData);
    // Registration logic would go here
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#3d312e]">
      {/* Left Panel - Branding */}
      <div className="w-1/2 flex flex-col justify-center items-center p-16 bg-[#f0eeee]">
        <div className="flex items-center mb-8">
          {/* Replace this with your logo */}
          <Image 
            src="/transparentLogo.png" // Update with your logo path
            alt="StudyFlow Logo"
            width={300} // Adjust based on your logo dimensions
            height={90} // Adjust based on your logo dimensions
            className="object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold mb-6 text-[#3d312e]">Welcome to Your Study Hub</h1>
        <p className="text-[#948585] mb-6">Optimize your learning routine with us</p>
      </div>

      {/* Right Panel - Form */}
      <div className="w-1/2 flex justify-center items-center p-12 bg-[#3d312e]">
        <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <h2 className="text-3xl font-bold mb-6 text-[#3d312e]">Register</h2>
            
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 mb-4 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#3d312e] placeholder-gray-400 text-gray-700"
              required
            />
            
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 mb-4 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#3d312e] placeholder-gray-400 text-gray-700"
              required
            />
            
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 mb-4 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#3d312e] placeholder-gray-400 text-gray-700"
              required
            />
            
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 mb-4 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#3d312e] placeholder-gray-400 text-gray-700"
              required
            />
            
            <div className="mb-4">
              <select
                name="studyLevel"
                value={formData.studyLevel}
                onChange={handleChange}
                className="w-full p-3 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#3d312e] text-gray-700"
                required
              >
                <option value="">Select Study Level</option>
                <option value="high_school">High School</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="graduate">Graduate</option>
              </select>
            </div>
            
            <div className="mb-6">
              <select
                name="dailyStudyGoal"
                value={formData.dailyStudyGoal}
                onChange={handleChange}
                className="w-full p-3 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#3d312e] text-gray-700"
                required
              >
                <option value="">Select Daily Study Goal</option>
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
                <option value="4">4 hours</option>
              </select>
            </div>
            
            <button
              type="submit"
              className="w-full bg-[#3d312e] text-white py-3 rounded hover:bg-[#4a3c38] transition font-medium"
            >
              Register
            </button>
            
            <p className="text-center mt-6 text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-[#3d312e] hover:underline">Log In</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}