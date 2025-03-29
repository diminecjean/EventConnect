export interface EventData {
  eventsData: Event[];
}

export interface Event {
  _id: string;
  id: string;
  eventLogo: EventLogo;
  host: Host;
  title: string;
  tags: Tag[];
  date: EventDate;
  location: string;
  description: Description;
}

export interface EventLogo {
  src: string;
  alt: string;
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
