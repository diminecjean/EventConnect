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
  X,
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
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const dismissNotification = (id: string) => {
    // First mark as read if it's not already read
    const notification = notifications.find((n) => n._id === id);
    if (notification && !notification.isRead) {
      markAsRead(id);
    }

    // Then dismiss from UI
    setDismissedIds((prev) => new Set([...Array.from(prev), id]));
  };

  // Filter out dismissed notifications
  const visibleNotifications = notifications.filter(
    (notification) => !dismissedIds.has(notification._id),
  );

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
        <PopoverContent className="bg-violet-300/50 border border-violet-400 max-h-[400px] flex flex-col">
          <h3 className="text-md font-semibold px-4 py-2 sticky top-0 bg-violet-300/50 z-10">
            Notifications
          </h3>

          {visibleNotifications.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No notifications yet
            </div>
          ) : (
            <div className="overflow-y-auto pr-1 flex-1">
              {visibleNotifications.map((notification) => {
                // Determine the link target based on notification type
                const linkHref =
                  notification.type === "FRIEND_REQUEST"
                    ? `/profile/user/${notification.recipientId}/connections`
                    : `/events/${notification.eventId}`;

                return (
                  <div
                    key={notification._id}
                    className="relative rounded-xl py-2 px-4 my-2 mx-2 hover:bg-violet-400/30 bg-violet-500/15"
                  >
                    <button
                      onClick={() => dismissNotification(notification._id)}
                      className="absolute top-2 right-2 p-1 hover:bg-violet-500/30 rounded-full"
                      aria-label="Dismiss notification"
                    >
                      <X size={14} className="text-gray-400 hover:text-white" />
                    </button>
                    <Link
                      href={linkHref}
                      onClick={() => markAsRead(notification._id)}
                      className="block"
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
                  </div>
                );
              })}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
