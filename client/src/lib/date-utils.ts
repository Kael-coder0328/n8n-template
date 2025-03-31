/**
 * Format a date string to a more readable format
 * @param dateString ISO date string to format
 * @returns Formatted date string (e.g., "January 1, 2023")
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return 'No date';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
} 