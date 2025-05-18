/**
 * @param title The title to be shown for the notification. e.g. New Event Created by {organization}
 * @param content To be shown for the notification. e.g. {Organization} posted a new event: {title}
 * @param recipientId User to be notified, based on the "subscriptions" collection
 * @param senderId Organization or User id, depending on the type of notification.
 * @param eventId Related event for the notification
 */
export type Notification = {
  _id: string;
  type: "NEW_EVENT" | "UPDATED_EVENT" | "FRIEND_REQUEST" | "JOINED_EVENT";
  title: string;
  content: string;
  recipientId: string;
  senderId: string; // Can be organization associated with the event, or friend request from other users.
  eventId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt?: Date;
};
