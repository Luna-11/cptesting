"use client";
import { useState } from "react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("about");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "AlessiaTaulli",
    currentPassword: "",
    newPassword: "",
  });
  const [profileImage, setProfileImage] = useState("/p6.png");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setProfileImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Banner */}
      <div
        className="h-48 bg-cover bg-center flex items-center justify-center relative"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <h1 className="text-white text-4xl font-bold text-center relative z-10 px-4">
          The Sky tells me there are <br />
          <span className="text-purple-400">No limits</span> and curiosity tells me to{" "}
          <span className="text-blue-300">Explore</span>
        </h1>
      </div>

      <div className="flex flex-col md:flex-row max-w-6xl mx-auto w-full px-4 -mt-16 mb-8 gap-8">
        {/* Left Profile Card */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <div className="flex flex-col items-center relative">
              <img
                src={profileImage}
                alt="Profile"
                className="w-40 h-40 rounded-full border-4 border-white shadow-md -mt-20 object-cover"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer border border-gray-200">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>
              )}
            </div>

            <div className="mt-6 text-center">
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="text-2xl font-bold text-gray-800 text-center w-full px-2 py-1 border border-gray-300 rounded mb-2"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-800">{formData.username}</h2>
              )}
              <p className="text-gray-600">Graphic Designer & Illustrator</p>
              <p className="text-sm text-gray-500 mt-2">Molfetta, Italy</p>
            </div>

            <div className="mt-6 space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      className="flex-1 px-4 py-2 text-sm bg-pink-500 text-white rounded-md hover:bg-pink-600"
                    >
                      Save
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition"
                >
                  Edit Profile
                </button>
              )}

              <button
                onClick={() => alert("Account deletion confirmation goes here.")}
                className="w-full px-4 py-2 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition"
              >
                Delete Account
              </button>

              <a
                href="https://www.behance.net/alessiataulli"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                View Portfolio
              </a>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("about")}
                className={`px-6 py-3 font-medium capitalize ${
                  activeTab === "about"
                    ? "text-pink-500 border-b-2 border-pink-500"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab("account")}
                className={`px-6 py-3 font-medium capitalize ${
                  activeTab === "account"
                    ? "text-pink-500 border-b-2 border-pink-500"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Account
              </button>
            </div>

            <div className="p-6 min-h-[300px]">
              {activeTab === "about" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">About Me</h3>
                  <p className="text-gray-700 mb-4">
                    Hi, I'm <strong>Alessia Taulli</strong>, a passionate graphic designer and illustrator based in Molfetta, Italy.
                  </p>
                  <p className="text-gray-700">
                    With over 5 years of experience in the design industry, I specialize in creating visually stunning illustrations and brand identities that tell compelling stories.
                  </p>
                </div>
              )}

              {activeTab === "account" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Account Information</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700">Email</h4>
                      <p className="text-gray-600">alessia@example.com</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Member Since</h4>
                      <p className="text-gray-600">January 2020</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Last Login</h4>
                      <p className="text-gray-600">2 hours ago</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Account Status</h4>
                      <p className="text-green-600">Active</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
