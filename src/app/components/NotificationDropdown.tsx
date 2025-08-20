// src/components/NotificationDropdown.tsx
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Notification {
  notification_id: number;
  title: string;
  message: string;
  type: string;
  status: string;
  created_at: string;
  purchase_status?: string;
}

interface NotificationDropdownProps {
  onClose: () => void;
  updateUnreadCount: (count: number | ((prev: number) => number)) => void;
}

export default function NotificationDropdown({ onClose, updateUnreadCount }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/notifications", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch notifications");
        const data = await response.json();
        setNotifications(data);
        updateUnreadCount(data.filter((n: Notification) => n.status === "unread").length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [updateUnreadCount]);

  const markAsRead = async (notificationId: number) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
        credentials: "include",
      });
      setNotifications(prev =>
        prev.map(n =>
          n.notification_id === notificationId ? { ...n, status: "read" } : n
        )
      );
      updateUnreadCount((prev: number) => prev - 1);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div 
      className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 border-b border-gray-200 bg-indigo-50">
        <h3 className="text-lg font-medium text-indigo-800">Notifications</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No notifications yet</div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.notification_id}
              className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                notification.status === "unread" ? "bg-blue-50" : ""
              }`}
              onClick={() => markAsRead(notification.notification_id)}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-900">
                  {notification.title}
                </h4>
                {notification.purchase_status && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                      notification.purchase_status
                    )}`}
                  >
                    {notification.purchase_status}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(notification.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
      <div className="p-2 border-t border-gray-200 text-center bg-gray-50">
        <Link 
          href="/notifications" 
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          onClick={onClose}
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}