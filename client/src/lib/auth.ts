// Authentication utilities for secure credential handling

/**
 * Generate a secure hash for the given password using SHA-256
 * @param password - The password to hash
 * @returns Promise<string> - The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify if the provided password matches the stored hash
 * @param password - The password to verify
 * @param storedHash - The stored hash to compare against
 * @returns Promise<boolean> - True if password matches
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === storedHash;
}

/**
 * Generate a secure session token
 * @returns string - A random session token
 */
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store authentication status securely
 * @param isAuthenticated - Whether the user is authenticated
 */
export function setAuthStatus(isAuthenticated: boolean): void {
  if (isAuthenticated) {
    const sessionToken = generateSessionToken();
    sessionStorage.setItem('auth_status', 'authenticated');
    sessionStorage.setItem('session_token', sessionToken);
    sessionStorage.setItem('auth_timestamp', Date.now().toString());
  } else {
    sessionStorage.removeItem('auth_status');
    sessionStorage.removeItem('session_token');
    sessionStorage.removeItem('auth_timestamp');
  }
}

/**
 * Check if the current session is valid
 * @returns boolean - True if session is valid
 */
export function isSessionValid(): boolean {
  const authStatus = sessionStorage.getItem('auth_status');
  const sessionToken = sessionStorage.getItem('session_token');
  const authTimestamp = sessionStorage.getItem('auth_timestamp');
  
  if (!authStatus || !sessionToken || !authTimestamp) {
    return false;
  }
  
  // Check if session is older than 8 hours (28800000 ms)
  const sessionAge = Date.now() - parseInt(authTimestamp);
  const maxSessionAge = 8 * 60 * 60 * 1000; // 8 hours
  
  if (sessionAge > maxSessionAge) {
    // Clear expired session
    setAuthStatus(false);
    return false;
  }
  
  return true;
}

/**
 * Clear all authentication data
 */
export function clearAuthData(): void {
  setAuthStatus(false);
}
