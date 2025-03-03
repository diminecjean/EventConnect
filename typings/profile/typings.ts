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
  contact_email: string;
  events_hosted: string[]; // Array of event IDs
  members_count: number;
  tags: string[]; // Topics of interest
  created_at: string; // ISO timestamp
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  bio?: string;
  profile_picture?: string;
  interests: string[]; // Topics of interest
  events_attended: string[]; // Array of event IDs
  badges_earned?: string[]; // Earned badges
  registered_at: string; // ISO timestamp
};
