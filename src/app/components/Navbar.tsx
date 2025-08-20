// src/components/Navbar.tsx
"use client";

import { Menu, Bell } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

type NavbarProps = {
  setIsSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  userRole?: number;
};

export default function Navbar({ setIsSidebarOpen, userRole }: NavbarProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Check if user is logged in (replace with your actual auth check)
  const isLoggedIn = true; // Set this based on your auth state

  // Fetch notifications when component mounts
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
    }
  }, [isLoggedIn]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => n.status === 'unread').length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      });
      setNotifications(prev => 
        prev.map(n => n.notification_id === id ? {...n, status: 'read'} : n)
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  return (
    <nav className="navbar py-6 text-center font-bold relative w-full">
      <div className="flex justify-between items-center w-full">
        {/* Left Side - Keep exactly as you had it */}
        <div className="text-xl flex-1 text-center">
          <p>Study-With-Me</p>
        </div>  

        {/* Right Side - Keep your existing structure */}
        <div className="flex items-center space-x-6 mr-8">
          <Link href="/login" className="hover:underline">Log In</Link>
          <Link href="/aboutUs" className="hover:underline">About Us</Link>
          
          {/* Enhanced Notification Bell (only change) */}
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

            {/* Notification dropdown - matches your existing style */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="p-2 border-b border-gray-200">
                  <p className="font-bold">Notifications</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div
                        key={notification.notification_id}
                        className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          notification.status === 'unread' ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => markAsRead(notification.notification_id)}
                      >
                        <div className="flex justify-between">
                          <p className="font-medium">{notification.title}</p>
                          {notification.purchase_status && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              notification.purchase_status === 'approved' ? 'bg-green-100 text-green-800' :
                              notification.purchase_status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {notification.purchase_status}
                            </span>
                          )}
                        </div>
                        <p className="text-sm mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="p-3 text-sm text-gray-500">No notifications</p>
                  )}
                </div>
                <div className="p-2 border-t border-gray-200 text-center">
                  <Link 
                    href="/notifications" 
                    className="text-sm hover:underline"
                    onClick={() => setShowNotifications(false)}
                  >
                    View all
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}