"use client";
import { useState } from 'react';
import { FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    console.log('Logging in:', username, password);
    // Do login logic here
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#3d312e]">
      {/* Left Panel - Branding */}
      <div className="w-1/2 flex flex-col justify-center items-center p-16 bg-[#f0eeee]">
        <img 
          src="/transparentLogo.png" 
          alt="Nike Logo" 
          className="w-20 mb-8" 
        />
        <h1 className="text-3xl font-bold mb-6 text-[#3d312e]">Welcome to The Nike User Area</h1>
        <p className="text-[#948585] mb-6">To request an account, just call us</p>
        <div className="text-lg mb-6">
          <p className="font-bold mb-2 text-[#3d312e]">+245 04 166 0355</p>
          <p className="font-bold text-[#948585]">+347 42 390 2456</p>
        </div>
        <div className="flex space-x-4 text-[#948585]">
          <FaFacebookF />
          <FaTwitter />
          <FaLinkedinIn />
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-1/2 flex justify-center items-center p-12 bg-[#3d312e]">
        <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <h2 className="text-3xl font-bold mb-6 text-[#3d312e]">Log in</h2>
            <p className="mb-6 text-sm text-[#948585]">
              Please enter your credentials. <br />
              Won't be shared publicly.
            </p>
            <input
              type="text"
              placeholder="User name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 mb-4 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#3d312e] placeholder-gray-400 text-gray-700"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-6 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#3d312e] placeholder-gray-400 text-gray-700"
              required
            />
            <button
              type="submit"
              className="w-full bg-[#3d312e] text-white py-3 rounded hover:bg-[#4a3c38] transition font-medium"
            >
              Log in
            </button>
            <p className="text-center mt-6 text-gray-600">
              <a href="/" className="text-[#3d312e] hover:underline">Back to home page</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}