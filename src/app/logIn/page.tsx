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
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col justify-center items-center p-16 bg-white">
        <img src="/nike-logo.png" alt="Nike Logo" className="w-20 mb-8" />
        <h1 className="text-3xl font-bold mb-6">Welcome to The Nike User Area</h1>
        <p className="text-gray-600 mb-6">To request an account, just call us</p>
        <div className="text-lg mb-6">
          <p className="font-bold mb-2">+245 04 166 0355</p>
          <p className="font-bold text-red-500">+347 42 390 2456</p>
        </div>
        <div className="flex space-x-4 text-gray-600">
          <FaFacebookF />
          <FaTwitter />
          <FaLinkedinIn />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex justify-center items-center p-12">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Log in</h2>
          <p className="text-gray-600 mb-6">
            Please enter your credentials. <br />
            Won’t be shared publicly.
          </p>
          <input
            type="text"
            placeholder="User name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-red-500 text-white py-3 rounded hover:bg-red-600 transition"
          >
            Log in
          </button>
          <p className="text-center mt-6">
            <a href="/" className="text-red-500 hover:underline">Back to home page</a>
          </p>
        </form>
      </div>
    </div>
  );
}
