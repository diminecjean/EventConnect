export interface EventData {
  events: Event[];
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  location: string;
  startDate: string | Date;
  endDate: string | Date;
  maxAttendees?: number;
  partnerOrganizations: Array<{ $oid: string }>;
  imageUrl: string;
  bannerUrl: string;
  eventMode: "physical" | "hybrid" | "online";
  virtualMeetingLink?: string;
  organizationId: { $oid: string };
  registrationForms: RegistrationForm[];
  timelineItems: TimelineItem[];
  speakers: Speaker[];
  sponsors: Sponsor[];
  galleryImages: string[];
  postMaterials: 
  createdAt?: string | Date;
  updatedAt?: string | Date;

  // Keep these for backward compatibility
  id?: string;
  eventLogo?: EventLogo;
  host?: Host;
  tags?: Tag[];
  date?: EventDate;
}

export interface EventLogo {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface Host {
  logo: string;
  name: string;
}

export interface Tag {
  label: string;
  color: string;
}

export interface EventDate {
  fullDate: string;
  time: string;
}

export interface Description {
  preview: string;
  details: string[];
}

export interface RegistrationForm {
  id: string;
  name: string;
  description: string;
  formFields: FormField[];
  isDefault: boolean;
}

export interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "number" | "select" | "textarea" | "checkbox";
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface TimelineItem {
  id: string;
  date: string | Date;
  time: string;
  title: string;
  description?: string;
  speaker?: string;
}

export interface Speaker {
  id: string;
  name: string;
  topic: string;
  introduction?: string;
  organization?: string;
  position?: string;
  imageUrl?: string;
  socialMedia: SocialMediaLink[];
}

export interface SocialMediaLink {
  id: string;
  platform: string;
  url: string;
}

export interface Sponsor {
  id: string;
  name: string;
  sponsorType?: string;
  logoUrl?: string;
  description?: string;
  socialLinks?: SocialMediaLink[];
}
