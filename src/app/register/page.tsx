"use client";
import { useState } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      } else {
        alert('Registration failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('An unexpected error occurred.');
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#3d312e]">
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col justify-center items-center p-16 bg-[#f0eeee]">
        <Image 
          src="/transparentLogo.png"
          alt="StudyFlow Logo"
          width={300}
          height={90}
          className="object-contain"
        />
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
              required
              className="w-full p-3 mb-4 border rounded"
            />

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full p-3 mb-4 border rounded"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 mb-4 border rounded"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full p-3 mb-4 border rounded"
            />

            <select
              name="studyLevel"
              value={formData.studyLevel}
              onChange={handleChange}
              required
              className="w-full p-3 mb-4 border rounded"
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
              className="w-full p-3 mb-6 border rounded"
            >
              <option value="">Select Daily Study Goal</option>
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="4">4 hours</option>
            </select>

            <button
              type="submit"
              className="w-full bg-[#3d312e] text-white py-3 rounded hover:bg-[#4a3c38] transition"
            >
              Register
            </button>

            <p className="text-center mt-6 text-gray-600">
              Already have an account? <a href="/logIn" className="text-[#3d312e] hover:underline">Log In</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
