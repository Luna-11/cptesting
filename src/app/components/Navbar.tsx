// src/components/Navbar.tsx
"use client";

import { Bell, LogOut, LogIn } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import NotificationDropdown from "./NotificationDropdown";

type NavbarProps = {
  setIsSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  userRole?: string;
  isAuthenticated?: boolean;
};

export default function Navbar({ setIsSidebarOpen, userRole }: NavbarProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    console.log("Logging out...");
  };

  return (
    <nav className="navbar py-4 md:py-6 text-center font-bold relative w-full">
      <div className="flex justify-between items-center w-full px-4 md:px-8">
        {/* Left spacer for balance */}
        <div className="flex-1"></div>

        {/* Center Title */}
        <div className="text-lg md:text-xl lg:text-2xl flex-1 md:flex-none text-center mx-4">
          <p className="whitespace-nowrap">Study-With-Me</p>
        </div>

        {/* Right Side Navigation */}
        <div className="flex items-center space-x-4 md:space-x-6 flex-1 justify-end">
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1 md:p-1.5 rounded-full hover:bg-gray-100 hover:bg-opacity-10 text-white transition-colors"
              type="button"
            >
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-3 h-3 md:w-4 md:h-4 text-xs text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <NotificationDropdown 
                onClose={() => setShowNotifications(false)}
                updateUnreadCount={setUnreadCount}
              />
            )}
          </div>

          {/* Login Icon with Link */}
          <Link 
            href="/login" 
            className="p-1 md:p-1.5 rounded-full hover:bg-gray-100 hover:bg-opacity-10 text-white transition-colors"
            title="Log In"
          >
            <LogIn className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}