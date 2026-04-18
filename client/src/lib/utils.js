import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * @param {...(string|object|array)} inputs - Class names to merge
 * @returns {string} Merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in PKR
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Get status badge color based on status
 * @param {string} status - Status string
 * @returns {string} Tailwind color classes
 */
export function getStatusColor(status) {
  const statusColors = {
    pending: 'bg-warning-light text-warning-dark border-warning',
    approved: 'bg-success-light text-success-dark border-success',
    rejected: 'bg-error-light text-error-dark border-error',
    completed: 'bg-success-light text-success-dark border-success',
    confirmed: 'bg-info-light text-info-dark border-info',
    under_review: 'bg-info-light text-info-dark border-info',
  };

  return statusColors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
}

/**
 * Build a human-readable error description from an api.js rejection.
 * Surfaces the first field-level validation error if present, else the message.
 */
export function formatApiError(err) {
  if (!err) return 'Something went wrong';
  if (Array.isArray(err.errors) && err.errors.length > 0) {
    const first = err.errors[0];
    return first.field ? `${first.field}: ${first.message}` : first.message;
  }
  return err.message || 'Something went wrong';
}
