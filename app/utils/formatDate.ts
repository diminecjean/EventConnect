/**
 * Formats event dates and times for display
 * @param startDate - Event start date (MongoDB format or Date object)
 * @param endDate - Event end date (MongoDB format or Date object)
 * @returns Object with formatted date and time strings
 */
export const formatEventDateTime = (
  startDate: Date | string | { $date: string },
  endDate: Date | string | { $date: string },
) => {
  console.log({ startDate, endDate });

  // Handle MongoDB date format ($date property)
  const startDateValue =
    startDate && typeof startDate === "object" && "$date" in startDate
      ? startDate.$date
      : startDate;

  const endDateValue =
    endDate && typeof endDate === "object" && "$date" in endDate
      ? endDate.$date
      : endDate;

  // Convert to Date objects
  const start =
    startDateValue instanceof Date ? startDateValue : new Date(startDateValue);
  const end =
    endDateValue instanceof Date ? endDateValue : new Date(endDateValue);

  // Rest of the function stays the same
  // Format the dates
  const startDateFormatted = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const endDateFormatted = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Format the times
  const startTimeFormatted = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const endTimeFormatted = end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Check if same day (compare year, month, and day)
  const isSameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  // Return formatted strings based on whether it's same day or multi-day
  return {
    date: isSameDay
      ? startDateFormatted
      : `${startDateFormatted} - ${endDateFormatted}`,
    time: `${startTimeFormatted} - ${endTimeFormatted}`,
  };
};

/**
 * Formats a single date into a readable string
 * @param date - Date to format (MongoDB format or Date object)
 * @param options - Formatting options
 * @returns Formatted date string
 */
export const formatSingleDate = (
  date: Date | string | { $date: string },
  options: {
    includeTime?: boolean;
    format?: "short" | "medium" | "long";
  } = { includeTime: false, format: "medium" },
) => {
  // Handle MongoDB date format ($date property)
  const dateValue =
    date && typeof date === "object" && "$date" in date ? date.$date : date;

  // Convert to Date object
  const dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue);

  // Apply different formatting based on the format option
  let dateFormat: Intl.DateTimeFormatOptions = {};

  switch (options.format) {
    case "short":
      dateFormat = {
        month: "numeric",
        day: "numeric",
        year: "2-digit",
      };
      break;
    case "long":
      dateFormat = {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      };
      break;
    case "medium":
    default:
      dateFormat = {
        month: "short",
        day: "numeric",
        year: "numeric",
      };
      break;
  }

  // Format the date
  const formattedDate = dateObj.toLocaleDateString("en-US", dateFormat);

  // Add time if requested
  if (options.includeTime) {
    const formattedTime = dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${formattedDate}, ${formattedTime}`;
  }

  return formattedDate;
};

// ...existing code...
