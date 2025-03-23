export type OrganizationProfile = {
  id: string;
  name: string;
  description: string;
  website?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    facebook?: string;
  };
  location: string;
  contact_email: string;
  events_hosted: string[]; // Array of event IDs
  members_count: number;
  tags: string[]; // Topics of interest
  created_at: string; // ISO timestamp
};

export type UserProfile = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  bio?: string;
  profile_picture?: string;
  interests: string[]; // Topics of interest
  events_attended: string[]; // Array of event IDs
  badges_earned?: string[]; // Earned badges
  registered_at: string; // ISO timestamp
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

