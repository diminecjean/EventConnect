export type Badge = {
  _id: string;
  name: string;
  description?: string;
  type: "PARTICIPANT" | "SPEAKER" | "SPONSOR" | "CUSTOM";
  imageUrl?: string;
  eventId: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};
