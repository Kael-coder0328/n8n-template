// Consistent date formatting for both server and client
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear().toString().slice(-2);
    return `${day} ${month} ${year}`;
  } catch {
    return '';
  }
};

// Format currency consistently
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format number with commas
export const formatNumber = (num: number | null | undefined): string => {
  if (num == null) return '';
  return new Intl.NumberFormat('en-US').format(num);
};

// Safe string formatter
export const formatString = (str: string | null | undefined): string => {
  return str || '';
};

export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}; 