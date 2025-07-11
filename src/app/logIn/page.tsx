'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include' // Important for cookies
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert(`Logged in as ${data.user.role}`);
        router.push('/');
      } else {
        alert(data.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong. Please try again later.');
    }
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
              className="w-full p-3 mb-6 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#3d312e] placeholder-gray-400 text-gray-700"
              required
            />

            <button
              type="submit"
              className="w-full bg-[#3d312e] text-white py-3 rounded hover:bg-[#4a3c38] transition font-medium"
            >
              Log in
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