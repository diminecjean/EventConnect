"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { BASE_URL } from "@/app/api/constants";
import { useAuth } from "@/app/context/authContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FriendDetails,
  FriendRequestDetails,
} from "@/app/typings/connections/typings";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function ConnectionsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user: currentUser } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [friends, setFriends] = useState<FriendDetails[]>([]);
  const [pendingRequests, setPendingRequests] = useState<
    FriendRequestDetails[]
  >([]);
  const [sentRequests, setSentRequests] = useState<FriendRequestDetails[]>([]);

  useEffect(() => {
    // Check if current user is viewing their own profile
    if (currentUser && currentUser._id === id) {
      setIsOwner(true);
      fetchConnections();
    } else if (currentUser) {
      // If not owner, only fetch accepted connections
      fetchFriends();
    }
  }, [id, currentUser]);

  //#region Fetch
  const fetchConnections = async () => {
    try {
      setIsLoading(true);

      // Fetch accepted connections (friends)
      const friendsResponse = await fetch(
        `${BASE_URL}/api/connections?userId=${id}&status=ACCEPTED`,
      );
      const friendsData = await friendsResponse.json();

      // Fetch pending requests (received)
      const pendingResponse = await fetch(
        `${BASE_URL}/api/connections?userId=${id}&status=PENDING`,
      );
      const pendingData = await pendingResponse.json();

      // Process the data to get user details
      const friendsList = await processConnections(friendsData.connections, id);
      const pendingList = await processPendingRequests(
        pendingData.connections,
        id,
      );

      setFriends(friendsList);
      setPendingRequests(pendingList.received);
      setSentRequests(pendingList.sent);
    } catch (error) {
      console.error("Error fetching connections:", error);
      toast.error("Failed to load connections");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      setIsLoading(true);

      // Only fetch accepted connections
      const friendsResponse = await fetch(
        `${BASE_URL}/api/connections?userId=${id}&status=ACCEPTED`,
      );
      const friendsData = await friendsResponse.json();

      // Process the data to get user details
      const friendsList = await processConnections(friendsData.connections, id);
      setFriends(friendsList);
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast.error("Failed to load friends");
    } finally {
      setIsLoading(false);
    }
  };
  //#endregion

  //#region process
  const processConnections = async (connections: any[], userId: string) => {
    const friendsList: FriendDetails[] = [];

    for (const connection of connections) {
      // Get the friend's ID (whichever ID is not the current user's)
      const friendId =
        connection.requesterId === userId
          ? connection.recipientId
          : connection.requesterId;

      // Fetch the friend's details
      try {
        const userResponse = await fetch(`${BASE_URL}/api/users/${friendId}`);
        const userData = await userResponse.json();

        if (userData.user) {
          friendsList.push({
            _id: userData.user._id,
            name: userData.user.name,
            email: userData.user.email,
            profilePicture: userData.user.profilePicture,
            connectionId: connection._id,
            status: connection.status,
            createdAt: new Date(connection.createdAt),
          });
        }
      } catch (error) {
        console.error(`Error fetching details for user ${friendId}:`, error);
      }
    }

    return friendsList;
  };

  const processPendingRequests = async (connections: any[], userId: string) => {
    const received: FriendRequestDetails[] = [];
    const sent: FriendRequestDetails[] = [];

    for (const connection of connections) {
      // Check if this is a received or sent request
      const isReceived = connection.recipientId === userId;
      const otherUserId = isReceived
        ? connection.requesterId
        : connection.recipientId;

      // Fetch the other user's details
      try {
        const userResponse = await fetch(
          `${BASE_URL}/api/users/${otherUserId}`,
        );
        const userData = await userResponse.json();

        if (userData.user) {
          const userDetails = {
            _id: userData.user._id,
            name: userData.user.name,
            email: userData.user.email,
            profilePicture: userData.user.profilePicture,
            connectionId: connection._id,
            createdAt: new Date(connection.createdAt),
          };

          if (isReceived) {
            received.push(userDetails);
          } else {
            sent.push(userDetails);
          }
        }
      } catch (error) {
        console.error(`Error fetching details for user ${otherUserId}:`, error);
      }
    }

    return { received, sent };
  };
  //#endregion

  //#region Handlers
  const handleAcceptRequest = async (connectionId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/connections/${connectionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "ACCEPTED", userId: id }),
        },
      );

      if (response.ok) {
        toast.success("Friend request accepted");
        // Update the UI
        setPendingRequests((prev) =>
          prev.filter((req) => req.connectionId !== connectionId),
        );
        // Refresh friends list
        fetchConnections();
      } else {
        throw new Error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Failed to accept friend request");
    }
  };

  const handleRejectRequest = async (connectionId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/connections/${connectionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "REJECTED", userId: id }),
        },
      );

      if (response.ok) {
        toast.success("Friend request rejected");
        // Update the UI
        setPendingRequests((prev) =>
          prev.filter((req) => req.connectionId !== connectionId),
        );
      } else {
        throw new Error("Failed to reject request");
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast.error("Failed to reject friend request");
    }
  };

  const handleRemoveFriend = async (connectionId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/connections/${connectionId}?userId=${id}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        toast.success("Friend removed successfully");
        // Update the UI
        setFriends((prev) =>
          prev.filter((friend) => friend.connectionId !== connectionId),
        );
      } else {
        throw new Error("Failed to remove friend");
      }
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error("Failed to remove friend");
    }
  };

  const handleCancelRequest = async (connectionId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/connections/${connectionId}?userId=${id}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        toast.success("Request cancelled successfully");
        // Update the UI
        setSentRequests((prev) =>
          prev.filter((req) => req.connectionId !== connectionId),
        );
      } else {
        throw new Error("Failed to cancel request");
      }
    } catch (error) {
      console.error("Error cancelling request:", error);
      toast.error("Failed to cancel request");
    }
  };
  //#endregion

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto mt-20">
      <Button
        variant="outline"
        className="mb-4 flex items-center gap-2"
        onClick={() => router.push(`/profile/user/${id}`)}
      >
        <ArrowLeft size={16} />
        Back to Profile
      </Button>
      <h1 className="text-2xl font-bold mb-6">Connections</h1>

      {isOwner ? (
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="friends">
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              Pending Requests ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent Requests ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends">
            {friends.length === 0 ? (
              <div className="text-center text-gray-400 my-12">
                <p>You haven't connected with anyone yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {friends.map((friend) => (
                  <FriendCard
                    key={friend._id}
                    friend={friend}
                    isOwner={isOwner}
                    onRemove={() => handleRemoveFriend(friend.connectionId)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests">
            {pendingRequests.length === 0 ? (
              <div className="text-center text-gray-400 my-12">
                <p>No pending friend requests</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendingRequests.map((request) => (
                  <FriendRequestCard
                    key={request._id}
                    request={request}
                    onAccept={() => handleAcceptRequest(request.connectionId)}
                    onReject={() => handleRejectRequest(request.connectionId)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent">
            {sentRequests.length === 0 ? (
              <div className="text-center text-gray-400 my-12">
                <p>No sent friend requests</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {sentRequests.map((request) => (
                  <SentRequestCard
                    key={request._id}
                    request={request}
                    onCancel={() => handleCancelRequest(request.connectionId)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Friends</h2>
          {friends.length === 0 ? (
            <div className="text-center text-gray-400 my-12">
              <p>This user hasn't connected with anyone yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {friends.map((friend) => (
                <FriendCard key={friend._id} friend={friend} isOwner={false} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Friend Card Component
function FriendCard({
  friend,
  isOwner,
  onRemove,
}: {
  friend: FriendDetails;
  isOwner: boolean;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center gap-4 border border-gray-700 rounded-lg p-4 bg-black/50">
      <div className="shrink-0">
        {friend.profilePicture ? (
          <div className="w-16 h-16 rounded-full overflow-hidden">
            <Image
              src={friend.profilePicture}
              alt={`${friend.name}'s profile picture`}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center">
            <span className="text-2xl text-white">{friend.name.charAt(0)}</span>
          </div>
        )}
      </div>

      <div className="flex-1">
        <Link
          href={`/profile/user/${friend._id}`}
          className="text-lg font-semibold hover:text-violet-400"
        >
          {friend.name}
        </Link>
        <p className="text-sm text-gray-400">{friend.email}</p>
      </div>

      {isOwner && onRemove && (
        <Button variant="destructive" size="sm" onClick={onRemove}>
          Remove
        </Button>
      )}
    </div>
  );
}

// Friend Request Card Component
function FriendRequestCard({
  request,
  onAccept,
  onReject,
}: {
  request: FriendRequestDetails;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div className="flex items-center gap-4 border border-gray-700 rounded-lg p-4 bg-black/50">
      <div className="shrink-0">
        {request.profilePicture ? (
          <div className="w-16 h-16 rounded-full overflow-hidden">
            <Image
              src={request.profilePicture}
              alt={`${request.name}'s profile picture`}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center">
            <span className="text-2xl text-white">
              {request.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1">
        <Link
          href={`/profile/user/${request._id}`}
          className="text-lg font-semibold hover:text-violet-400"
        >
          {request.name}
        </Link>
        <p className="text-sm text-gray-400">{request.email}</p>
        <p className="text-xs text-gray-500">
          Requested {new Date(request.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="default" size="sm" onClick={onAccept}>
          Accept
        </Button>
        <Button variant="outline" size="sm" onClick={onReject}>
          Decline
        </Button>
      </div>
    </div>
  );
}

// Sent Request Card Component
function SentRequestCard({
  request,
  onCancel,
}: {
  request: FriendRequestDetails;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-4 border border-gray-700 rounded-lg p-4 bg-black/50">
      <div className="shrink-0">
        {request.profilePicture ? (
          <div className="w-16 h-16 rounded-full overflow-hidden">
            <Image
              src={request.profilePicture}
              alt={`${request.name}'s profile picture`}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center">
            <span className="text-2xl text-white">
              {request.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1">
        <Link
          href={`/profile/user/${request._id}`}
          className="text-lg font-semibold hover:text-violet-400"
        >
          {request.name}
        </Link>
        <p className="text-sm text-gray-400">{request.email}</p>
        <p className="text-xs text-gray-500">
          Sent {new Date(request.createdAt).toLocaleDateString()}
        </p>
      </div>

      <Button variant="outline" size="sm" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
