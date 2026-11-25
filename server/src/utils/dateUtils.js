/**
 * Utility functions for consistent timezone handling and day generation
 */

export const normalizeDate = (date) => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

export const calculateDaysBetween = (startDate, endDate) => {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 1;
};

export const generateDayList = (startDate, endDate) => {
  const totalDays = calculateDaysBetween(startDate, endDate);
  const start = normalizeDate(startDate);
  const days = [];

  for (let i = 0; i < totalDays; i++) {
    const dayDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const isoString = dayDate.toISOString().split('T')[0];
    
    // Format human readable date like "Mon, Nov 10"
    const options = { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' };
    const formatted = new Intl.DateTimeFormat('en-US', options).format(dayDate);

    days.push({
      dayNumber: i + 1,
      date: isoString,
      formattedDate: formatted,
    });
  }

  return days;
};
