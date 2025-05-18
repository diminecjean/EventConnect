export type ConnectionStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED";

export type Connection = {
  _id: string;
  requesterId: string; // User who sent the friend request
  recipientId: string; // User who received the friend request
  status: ConnectionStatus;
  createdAt: Date;
  updatedAt?: Date;
};

export type FriendDetails = {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  connectionId: string; // Reference to the connection document
  status: ConnectionStatus;
  createdAt: Date;
};

export type FriendRequestDetails = {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  connectionId: string;
  createdAt: Date;
};
