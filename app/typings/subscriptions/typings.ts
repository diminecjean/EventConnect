export type Subscription = {
  _id: string;
  userId: string;
  organizationId: string;
  createdAt: Date;
};

export type SubscriberDetails = {
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
  subscribedAt?: Date | null;
};
