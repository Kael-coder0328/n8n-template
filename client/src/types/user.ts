/**
 * User data types used throughout the application
 */

export interface Subscription {
  status: string | null;
  productId: number | null;
  variantId: number | null;
}

export interface UserData {
  subscription: Subscription;
  timestamp?: number;
} 