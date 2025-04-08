type EventStatus = 'Upcoming' | 'Ongoing' | 'Completed';

/**
 * Determines the status of an event based on its start and end dates
 * @param startDate The start date of the event
 * @param endDate The end date of the event
 * @returns 'Upcoming', 'Ongoing', or 'Completed'
 */
export function getEventStatus(startDate?: string | Date, endDate?: string | Date): EventStatus {
  const now = new Date();
  
  // If no dates are provided, default to Upcoming
  if (!startDate) {
    return 'Upcoming';
  }
  
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = endDate ? (typeof endDate === 'string' ? new Date(endDate) : endDate) : null;
  
  // If event hasn't started yet
  if (now < start) {
    return 'Upcoming';
  }
  
  // If event has ended
  if (end && now > end) {
    return 'Completed';
  }
  
  // If event has started but not ended (or no end date specified)
  return 'Ongoing';
}

/**
 * Returns a style class based on event status
 * @param status The event status string
 * @returns CSS class name string
 */
export function getEventStatusStyle(status: EventStatus): string {
  switch (status) {
    case 'Upcoming':
      return 'text-blue-600 bg-blue-50';
    case 'Ongoing':
      return 'text-green-600 bg-green-50';
    case 'Completed':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}