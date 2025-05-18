"use client";
import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "./useNotifications";
import Link from "next/link";

export function NotificationBell() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-violet-400 hover:text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-black border border-stone-500 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-stone-500">
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No notifications yet
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <Link
                  key={notification._id}
                  href={`/events/${notification.eventId}`}
                  onClick={() => markAsRead(notification._id)}
                  className={`block p-4 hover:bg-black/80 border-b border-stone-500 ${!notification.isRead ? "bg-black/60" : ""}`}
                >
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-sm text-gray-300">
                    {notification.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
