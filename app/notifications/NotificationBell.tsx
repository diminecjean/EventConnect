"use client";
import { useState } from "react";
import {
  Bell,
  CalendarCheck,
  CalendarCheckIcon,
  CalendarSync,
  EggFriedIcon,
  LucideCalendarArrowUp,
  LucideCalendarPlus,
  PersonStanding,
} from "lucide-react";
import { useNotifications } from "./useNotifications";
import Link from "next/link";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotionLogoIcon, UpdateIcon } from "@radix-ui/react-icons";
import { Separator } from "@radix-ui/react-dropdown-menu";

export function NotificationBell() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
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
        </PopoverTrigger>
        <PopoverContent className="bg-violet-300/50 border border-violet-400">
          <h3 className="text-md font-semibold">Notifications</h3>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No notifications yet
            </div>
          ) : (
            <div>
              {notifications.map((notification) => {
                // Determine the link target based on notification type
                const linkHref =
                  notification.type === "FRIEND_REQUEST"
                    ? `/profile/user/${notification.recipientId}/connections`
                    : `/events/${notification.eventId}`;

                return (
                  <>
                    <Link
                      key={notification._id}
                      href={linkHref}
                      onClick={() => markAsRead(notification._id)}
                      className={`block rounded-xl py-2 px-4 my-2 hover:bg-violet-400/30 bg-violet-500/15`}
                    >
                      <div className="flex flex-row items-start gap-2">
                        <div className="flex flex-col items-center justify-center mt-1">
                          {notification.type === "FRIEND_REQUEST" ? (
                            <div className="relative">
                              <PersonStanding size={20} />
                              {!notification.isRead && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-2 h-2" />
                              )}
                            </div>
                          ) : notification.type === "UPDATE_EVENT" ? (
                            <div className="relative">
                              <CalendarSync size={20} />
                              {!notification.isRead && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-2 h-2" />
                              )}
                            </div>
                          ) : notification.type === "NEW_EVENT" ? (
                            <div className="relative">
                              <LucideCalendarPlus size={20} />
                              {!notification.isRead && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-2 h-2" />
                              )}
                            </div>
                          ) : notification.type === "JOINED_EVENT" ? (
                            <div className="relative">
                              <CalendarCheckIcon size={20} />
                              {!notification.isRead && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-2 h-2" />
                              )}
                            </div>
                          ) : (
                            <div className="relative">
                              <Bell size={20} />
                              {!notification.isRead && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-2 h-2" />
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div className="font-medium text-sm">
                            {notification.title}
                          </div>
                          <div className="text-xs text-gray-300">
                            {notification.content}
                          </div>
                          <div className="text-xs italic text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </>
                );
              })}
            </div>
          )}
        </PopoverContent>
      </Popover>
      {/* <button
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
            <h3 className="text-md font-semibold">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No notifications yet
            </div>
          ) : (
            <div>
              {notifications.map((notification) => {
                // Determine the link target based on notification type
                const linkHref =
                  notification.type === "FRIEND_REQUEST"
                    ? `/profile/user/${notification.recipientId}/connections`
                    : `/events/${notification.eventId}`;

                return (
                  <Link
                    key={notification._id}
                    href={linkHref}
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
                );
              })}
            </div>
          )}
        </div>
      )} */}
    </div>
  );
}
