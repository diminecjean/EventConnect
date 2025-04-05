import { EventFormValues } from "./schemas";

// Type for individual form field
export interface FormFieldType {
  id: string;
  label: string;
  type: "text" | "email" | "number" | "select" | "textarea" | "checkbox";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface TimelineItemType {
  id: string;
  date: Date;
  time: string;
  title: string;
  description?: string;
  speaker?: string;
}

// Type for registration form
export interface RegistrationFormType {
  id: string;
  name: string;
  description?: string;
  formFields: FormFieldType[];
  isDefault: boolean;
}

export interface SpeakerSocialMedia {
  id: string;
  platform: string;
  url: string;
}

export interface EventSpeaker {
  id: string;
  name: string;
  topic: string;
  organization?: string;
  position?: string;
  imageUrl?: string;
  socialMedia: SpeakerSocialMedia[];
}

export interface EventFormProps {
  organizationId: string;
  organizationName?: string;
  eventId?: string; // Optional - present only when editing
  eventName?: string; // Optional - present only when editing
  defaultValues?: Partial<EventFormValues>;
}
