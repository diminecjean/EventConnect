"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/context/authContext";
import { BASE_URL } from "@/app/api/constants";
import { Notification } from "@/app/typings/notifications/typings";

export function useNotifications(pollingInterval = 15000) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const lastPolledRef = useRef<string | null>(null);

  // Function to fetch all notifications
  const fetchAllNotifications = async () => {
    if (!user || !user._id) return;

    console.log({ userId: user._id });
    try {
      setIsLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/users/${user._id}/notifications`,
      );

      console.log({ response });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);

        // Count unread notifications
        const unread = data.notifications.filter(
          (n: Notification) => !n.isRead,
        ).length;
        setUnreadCount(unread);

        // Store timestamp for polling
        lastPolledRef.current = data.timestamp;
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to poll for new notifications
  const pollNewNotifications = async () => {
    if (!user || !user._id || !lastPolledRef.current) return;

    try {
      const response = await fetch(
        `${BASE_URL}/api/users/${user._id}/notifications?since=${encodeURIComponent(lastPolledRef.current)}`,
      );

      if (response.ok) {
        const data = await response.json();

        if (data.notifications && data.notifications.length > 0) {
          // Merge new notifications with existing ones
          setNotifications((prev) => [...data.notifications, ...prev]);

          // Update unread count
          setUnreadCount((prev) => prev + data.notifications.length);

          // Play notification sound (optional)
          // new Audio('/notification-sound.mp3').play().catch(e => console.log(e));
        }

        // Update timestamp for next poll
        lastPolledRef.current = data.timestamp;
      }
    } catch (error) {
      console.error("Error polling notifications:", error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`${BASE_URL}/api/notifications/${notificationId}/read`, {
        method: "POST",
      });

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n,
        ),
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Initial fetch of all notifications
  useEffect(() => {
    if (user && user._id) {
      fetchAllNotifications();
    }
  }, [user]);

  // Set up polling for new notifications
  useEffect(() => {
    if (!user || !user._id) return;

    const intervalId = setInterval(pollNewNotifications, pollingInterval);

    return () => clearInterval(intervalId);
  }, [user, pollingInterval]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    refreshNotifications: fetchAllNotifications,
  };
}
