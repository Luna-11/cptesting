"use client";
import { useState } from "react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("about");
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);
  const [formData, setFormData] = useState({
    username: "AlessiaTaulli",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    address: "Molfetta, Italy"
  });
  const [profileImage, setProfileImage] = useState("/p6.png");
  const [aboutMe, setAboutMe] = useState({
    intro: "Hi, I'm Alessia Taulli, a passionate graphic designer and illustrator based in Molfetta, Italy.",
    description: "With over 5 years of experience in the design industry, I specialize in creating visually stunning illustrations and brand identities that tell compelling stories."
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAboutChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAboutMe((prev) => ({ ...prev, [name]: value }));
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

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Password form submitted:", formData);
    setIsEditingPassword(false);
    // Clear password fields after submission
    setFormData(prev => ({...prev, currentPassword: "", newPassword: "", confirmPassword: ""}));
  };

  const handleAboutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("About form submitted:", aboutMe);
    setIsEditingAbout(false);
  };

  const handlePortfolioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Portfolio form submitted:", formData);
    setIsEditingPortfolio(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Edit Password Modal */}
      {isEditingPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Change Password</h3>
              <button
                onClick={() => setIsEditingPassword(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4">
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
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditingPassword(false)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm bg-pink-500 text-white rounded-md hover:bg-pink-600"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit About Me Modal */}
      {isEditingAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Edit About Me</h3>
              <button
                onClick={() => setIsEditingAbout(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAboutSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Introduction
                  </label>
                  <textarea
                    name="intro"
                    value={aboutMe.intro}
                    onChange={handleAboutChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-20"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={aboutMe.description}
                    onChange={handleAboutChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-32"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditingAbout(false)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm bg-pink-500 text-white rounded-md hover:bg-pink-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Portfolio Modal (now includes profile edits) */}
      {isEditingPortfolio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Edit Profile Details</h3>
              <button
                onClick={() => setIsEditingPortfolio(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePortfolioSubmit}>
              <div className="flex flex-col items-center mb-4">
                <div className="relative">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
                  />
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
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Portfolio Link
                  </label>
                  <input
                    type="text"
                    value="https://www.behance.net/alessiataulli"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditingPortfolio(false)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm bg-pink-500 text-white rounded-md hover:bg-pink-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            </div>

            <div className="mt-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">{formData.username}</h2>
              <p className="text-gray-600">Graphic Designer & Illustrator</p>
              <p className="text-sm text-gray-500 mt-2">{formData.address}</p>
            </div>

            <div className="mt-6 space-y-4">
              <button
                onClick={() => setIsEditingPassword(true)}
                className="w-full px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition"
              >
                Change Password
              </button>

              <button
                onClick={() => setIsEditingPortfolio(true)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                Edit Profile Details
              </button>
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
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">About Me</h3>
                    <button
                      onClick={() => setIsEditingAbout(true)}
                      className="px-3 py-1 text-sm bg-pink-500 text-white rounded-md hover:bg-pink-600 transition"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-gray-700 mb-4">
                    {aboutMe.intro}
                  </p>
                  <p className="text-gray-700">
                    {aboutMe.description}
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