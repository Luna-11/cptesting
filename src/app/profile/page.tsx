"use client";
import { useState, useEffect } from "react";export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Section with Image */}
      <div
        className="h-96 bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/your-image.png')" }}
      >
        <h1 className="text-white text-4xl font-bold text-center">
          The Sky tells me there are <br />
          <span className="text-orange-300">No limits</span> and curiosity tells me to <span className="text-blue-300">Explore</span>
        </h1>
      </div>

      {/* About Me Section */}
      <div className="bg-white py-12 px-6 max-w-4xl mx-auto text-center">
        {/* "About Me" Title */}
        <h2 className="text-3xl font-bold">About Me</h2>

        {/* Profile Picture */}
        <div className="flex flex-col items-center mt-4">
          <img
            src="/your-profile-picture.png"
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-gray-300"
          />
        </div>

        {/* Profile Details */}
        <div className="mt-6 text-gray-700 text-lg text-left">
          <p><strong>Full Name:</strong> Alessia Taulli</p>
          <p><strong>Email:</strong> alessia.taulli@gmail.com</p>
          <p><strong>Webfolio:</strong> <a href="https://www.behance.net/alessiataulli" className="text-blue-500">www.behance.net/alessiataulli</a></p>
        </div>

        {/* Description */}
        <p className="mt-6 text-gray-600 text-left">
          Hi, I'm <strong>Alessia Taulli</strong>. I'm a graphic designer and an illustrator based in Molfetta (Italy). 
          I love my job because it allows me to explore myself through shapes, colors, and styles. 
          I aim for simplicity without losing originality. Bright and saturated colors are my style, making my designs unique and personal.
        </p>

        {/* Interests */}
        <div className="mt-6 flex justify-center gap-6">
          <div className="text-center">
            <span className="text-2xl">🎨</span>
            <p className="text-sm text-gray-500">Illustration</p>
          </div>
          <div className="text-center">
            <span className="text-2xl">📐</span>
            <p className="text-sm text-gray-500">Graphic Design</p>
          </div>
          <div className="text-center">
            <span className="text-2xl">🍸</span>
            <p className="text-sm text-gray-500">Lifestyle</p>
          </div>
        </div>

        {/* Download Resume Button */}
        <button className="mt-8 px-6 py-3 bg-pink-500 text-white rounded-full shadow-md hover:bg-pink-600 transition">
          Download Resume
        </button>
      </div>
    </div>
  );
}
