"use client";
import { useAuth } from "@/app/context/authContext";
import { useState, useCallback } from "react";
import { BASE_URL } from "@/app/api/constants";
import { toast } from "sonner";

export type ConnectionStatus = "PENDING" | "ACCEPTED" | "REJECTED" | null;

export function useConnections() {
  const { user: currentUser } = useAuth();
  const [connectionStatuses, setConnectionStatuses] = useState<
    Record<string, ConnectionStatus>
  >({});
  const [pendingConnections, setPendingConnections] = useState<
    Record<string, boolean>
  >({});

  const checkConnectionStatuses = useCallback(
    async (userIds: string[]) => {
      if (!currentUser || !currentUser._id || userIds.length === 0) return;

      try {
        // Fetch all connections for the current user
        const response = await fetch(
          `${BASE_URL}/api/connections?userId=${currentUser._id}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch connections");
        }

        const data = await response.json();
        const connections = data.connections || [];

        // Create a map of userId to connection status
        const statusMap: Record<string, ConnectionStatus> = {};

        connections.forEach((connection: any) => {
          const otherUserId =
            connection.requesterId === currentUser._id
              ? connection.recipientId
              : connection.requesterId;

          statusMap[otherUserId] = connection.status as ConnectionStatus;
        });

        setConnectionStatuses(statusMap);
        return statusMap;
      } catch (error) {
        console.error("Error checking connection statuses:", error);
        return null;
      }
    },
    [currentUser],
  );

  const sendConnectionRequest = useCallback(
    async (userId: string) => {
      if (!currentUser || !currentUser._id) {
        toast.error("You must be logged in to connect with others");
        return false;
      }

      if (currentUser._id === userId) {
        toast.error("You cannot connect with yourself");
        return false;
      }

      // Set pending state for UI feedback
      setPendingConnections((prev) => ({ ...prev, [userId]: true }));

      try {
        const response = await fetch(`${BASE_URL}/api/connections`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requesterId: currentUser._id,
            recipientId: userId,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("Connection request sent successfully");
          // Update connection status
          setConnectionStatuses((prev) => ({
            ...prev,
            [userId]: "PENDING",
          }));
          return true;
        } else if (data.connectionStatus) {
          // If connection already exists, update status
          setConnectionStatuses((prev) => ({
            ...prev,
            [userId]: data.connectionStatus as ConnectionStatus,
          }));
          toast.info(
            `You already have a ${data.connectionStatus.toLowerCase()} connection with this user`,
          );
          return false;
        } else {
          throw new Error(data.error || "Failed to send connection request");
        }
      } catch (error) {
        console.error("Error sending connection request:", error);
        toast.error("Failed to send connection request");
        return false;
      } finally {
        setPendingConnections((prev) => ({ ...prev, [userId]: false }));
      }
    },
    [currentUser],
  );

  const acceptConnectionRequest = useCallback(
    async (connectionId: string) => {
      if (!currentUser || !currentUser._id) return false;

      try {
        const response = await fetch(
          `${BASE_URL}/api/connections/${connectionId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "ACCEPTED",
              userId: currentUser._id,
            }),
          },
        );

        if (response.ok) {
          toast.success("Friend request accepted");
          return true;
        } else {
          throw new Error("Failed to accept request");
        }
      } catch (error) {
        console.error("Error accepting friend request:", error);
        toast.error("Failed to accept friend request");
        return false;
      }
    },
    [currentUser],
  );

  const rejectConnectionRequest = useCallback(
    async (connectionId: string) => {
      if (!currentUser || !currentUser._id) return false;

      try {
        const response = await fetch(
          `${BASE_URL}/api/connections/${connectionId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "REJECTED",
              userId: currentUser._id,
            }),
          },
        );

        if (response.ok) {
          toast.success("Friend request rejected");
          return true;
        } else {
          throw new Error("Failed to reject request");
        }
      } catch (error) {
        console.error("Error rejecting friend request:", error);
        toast.error("Failed to reject friend request");
        return false;
      }
    },
    [currentUser],
  );

  const removeConnection = useCallback(
    async (connectionId: string) => {
      if (!currentUser || !currentUser._id) return false;

      try {
        const response = await fetch(
          `${BASE_URL}/api/connections/${connectionId}?userId=${currentUser._id}`,
          {
            method: "DELETE",
          },
        );

        if (response.ok) {
          toast.success("Connection removed successfully");
          return true;
        } else {
          throw new Error("Failed to remove connection");
        }
      } catch (error) {
        console.error("Error removing connection:", error);
        toast.error("Failed to remove connection");
        return false;
      }
    },
    [currentUser],
  );

  const getConnectionButtonText = useCallback(
    (userId: string) => {
      const status = connectionStatuses[userId];

      if (!status) return "Connect";

      switch (status) {
        case "PENDING":
          return "Request Sent";
        case "ACCEPTED":
          return "Connected";
        case "REJECTED":
          return "Connect";
        default:
          return "Connect";
      }
    },
    [connectionStatuses],
  );

  const isConnectionPending = useCallback(
    (userId: string) => {
      return pendingConnections[userId] || false;
    },
    [pendingConnections],
  );

  const shouldDisableConnectButton = useCallback(
    (userId: string) => {
      return (
        pendingConnections[userId] ||
        connectionStatuses[userId] === "PENDING" ||
        connectionStatuses[userId] === "ACCEPTED"
      );
    },
    [pendingConnections, connectionStatuses],
  );

  return {
    connectionStatuses,
    pendingConnections,
    checkConnectionStatuses,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    removeConnection,
    getConnectionButtonText,
    isConnectionPending,
    shouldDisableConnectButton,
  };
}
