export type OrganizationProfile = {
  _id: string;
  name: string;
  description: string;
  logo: string;
  banner?: string;
  website?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    facebook?: string;
  };
  location: string;
  contactEmail: string;
  membersCount: number;
  tags: string[]; // Topics of interest
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
};

export type UserProfile = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  bio?: string;
  profilePicture?: string;
  interests: string[]; // Topics of interest
  eventsAttended: string[]; // Array of event IDs
  badgesEarned?: string[]; // Earned badges
  organizations?: string[]; // Organization ID
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
};

export enum ACCOUNT_TYPE {
  ORGANIZATION = "organization",
  USER = "user",
}

export enum USER_ROLE {
  ORGANIZER = "organizer",
  PARTICIPANT = "participant",
  SPONSOR = "sponsor",
  SPEAKER = "speaker",
  PARTNER = "partner",
  COMMUNITY_BUILDER = "community_builder",
  VOLUNTEER = "volunteer",
}

export type SignUpType = ACCOUNT_TYPE.USER | ACCOUNT_TYPE.ORGANIZATION | "";
