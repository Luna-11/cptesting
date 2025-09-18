"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Notification {
  notification_id: number;
  user_id: number;
  payment_id: number | null;
  title: string;
  message: string;
  type: string;
  status: string;
  purchase_status: string | null;
  link: string | null;
  created_at: string;
}

interface NotificationDropdownProps {
  onClose: () => void;
  updateUnreadCount: (count: number | ((prev: number) => number)) => void;
}

export default function NotificationDropdown({
  onClose,
  updateUnreadCount,
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/notifications", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch notifications: ${response.status}`);
        }

        const data = await response.json();

        const notificationsArray = Array.isArray(data)
          ? data
          : data.success === false
          ? []
          : data.notifications || [];

        setNotifications(notificationsArray);

        const unreadCount = notificationsArray.filter(
          (n: Notification) => n.status === "unread"
        ).length;

        updateUnreadCount(unreadCount);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [updateUnreadCount]);

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === notificationId ? { ...n, status: "read" } : n
        )
      );

      updateUnreadCount((prev: number) => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

const markAllAsRead = async () => {
  try {
    const response = await fetch("/api/notifications", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ all: true }),
      credentials: "include", // ✅ needed for cookies
    });

    if (!response.ok) {
      throw new Error("Failed to mark all as read");
    }

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, status: "read" }))
    );

    // also reset unread count to 0
    updateUnreadCount(0);
  } catch (error) {
    console.error(error);
  }
};



  const handleNotificationClick = (n: Notification) => {
    if (n.status === "unread") {
      markAsRead(n.notification_id);
    }

    if (n.link) {
      window.location.href = n.link;
    } else if (n.payment_id && n.purchase_status) {
      window.location.href = "/purchases";
    }
  };

  const getStatusColor = (status?: string | null) => {
    if (!status) return "bg-gray-100 text-gray-800";

    switch (status.toLowerCase()) {
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

  const formatMessage = (message: string) => {
    if (message.length > 60) {
      return message.substring(0, 60) + "...";
    }
    return message;
  };

  return (
    <div
      className="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-300"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-300 bg-[#d8c7c7] flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#2b211e]">Notifications</h3>
        <button
          onClick={onClose}
          className="text-[#2b211e] hover:text-[#5d4b47] text-sm px-3 py-1 rounded transition-colors duration-300"
          style={{ background: "rgba(0,0,0,0.1)" }}
        >
          Close
        </button>
      </div>

      {/* Body */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-[#2b211e] animate-pulse">
            Loading notifications...
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-700">Error: {error}</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-[#2b211e]">
            📭 No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.notification_id}
              className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition ${
                n.status === "unread" ? "bg-blue-50" : ""
              }`}
              onClick={() => handleNotificationClick(n)}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-[#2b211e]">{n.title}</h4>
                {n.purchase_status && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                      n.purchase_status
                    )}`}
                  >
                    {n.purchase_status}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 mt-1">
                {formatMessage(n.message)}
              </p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-600">
                  {new Date(n.created_at).toLocaleString()}
                </p>
                {n.status === "unread" && (
                  <span className="text-xs text-blue-600 font-medium">
                    • New
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer → Clear All */}
      <div className="p-3 border-t border-gray-300 text-center bg-gray-100">
        <button
          onClick={markAllAsRead}
          className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors duration-300"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
