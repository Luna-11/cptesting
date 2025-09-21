// src/components/Navbar.tsx
"use client";

import { UserRole } from "./Sidebar";
import { Menu, Bell } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import NotificationDropdown from "./NotificationDropdown";

type NavbarProps = {
  setIsSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  userRole?: UserRole;
};

export default function Navbar({ setIsSidebarOpen, userRole }: NavbarProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is logged in (replace with your actual auth check)
  const isLoggedIn = true;

  const updateUnreadCount = (count: number | ((prev: number) => number)) => {
    if (typeof count === 'function') {
      setUnreadCount(count);
    } else {
      setUnreadCount(count);
    }
  };

  return (
    <nav className="navbar py-6 text-center font-bold relative w-full">
      <div className="flex justify-between items-center w-full">
        {/* Left Side - Made same width as right side for balance */}
        <div className="flex-1 flex justify-start">
          {setIsSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="ml-4 p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Center Title - Now properly centered */}
        <div className="text-xl flex-1 text-center">
          <p>Study-With-Me</p>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-6 mr-8 flex-1 justify-end">
          <Link href="/login" className="hover:underline">Log In</Link>
          <Link href="/aboutUs" className="hover:underline">About Us</Link>
          
          {/* Enhanced Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1 rounded-full hover:bg-gray-100 relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Use the NotificationDropdown component */}
            {showNotifications && (
              <NotificationDropdown 
                onClose={() => setShowNotifications(false)}
                updateUnreadCount={updateUnreadCount}
              />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}