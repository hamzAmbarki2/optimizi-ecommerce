// Utility functions for user role management

export type UserRole = 'client' | 'admin' | 'fournisseur';

/**
 * Determine user role based on email domain or specific patterns
 * @param email - User email address
 * @returns UserRole - The determined role
 */
export function getUserRole(email: string): UserRole {
  if (!email) return 'client';
  
  const emailLower = email.toLowerCase();
  
  // Admin emails - you can customize these patterns
  const adminPatterns = [
    '@admin.',
    'admin@',
    '@optimizi.com',
    '@optimizi.admin',
    '@esprit.tn', // Add university domain for admin access
    '@enit.utm.tn', // Add other educational domains
    '@isg.rnu.tn'
  ];
  
  // Fournisseur emails - you can customize these patterns
  const fournisseurPatterns = [
    '@fournisseur.',
    'fournisseur@',
    '@supplier.',
    'supplier@',
    '@vendor.',
    'vendor@',
    '@business.',
    'business@'
  ];
  
  // Specific admin emails (exact matches)
  const specificAdminEmails = [
    'hbib.mbarki@esprit.tn',
    'hbib.mbarki@gmail.com', // Add the Gmail address
    'admin@test.com',
    'test@admin.com'
  ];
  
  // Check for specific admin emails first
  if (specificAdminEmails.includes(emailLower)) {
    return 'admin';
  }
  
  // Check for admin patterns
  for (const pattern of adminPatterns) {
    if (emailLower.includes(pattern)) {
      return 'admin';
    }
  }
  
  // Check for fournisseur patterns
  for (const pattern of fournisseurPatterns) {
    if (emailLower.includes(pattern)) {
      return 'fournisseur';
    }
  }
  
  // Default to client
  return 'client';
}

/**
 * Check if user has admin or fournisseur privileges
 * @param email - User email address
 * @returns boolean - True if user has admin/fournisseur privileges
 */
export function hasAdminPrivileges(email: string): boolean {
  const role = getUserRole(email);
  return role === 'admin' || role === 'fournisseur';
}

/**
 * Check if user is a client
 * @param email - User email address
 * @returns boolean - True if user is a client
 */
export function isClient(email: string): boolean {
  return getUserRole(email) === 'client';
}

/**
 * Get the appropriate redirect URL based on user role
 * @param email - User email address
 * @returns string - The redirect URL
 */
export function getRoleBasedRedirectUrl(email: string): string {
  const role = getUserRole(email);
  
  switch (role) {
    case 'admin':
    case 'fournisseur':
      // Redirect to admin interface (you might need to adjust this URL)
      return 'http://localhost:5174'; // Admin interface URL
    case 'client':
    default:
      return '/'; // Client interface home page
  }
}

/**
 * Validate if user can access the current interface
 * @param email - User email address
 * @param interfaceType - 'client' or 'admin'
 * @returns boolean - True if access is allowed
 */
export function canAccessInterface(email: string, interfaceType: 'client' | 'admin'): boolean {
  const role = getUserRole(email);
  
  if (interfaceType === 'admin') {
    return role === 'admin' || role === 'fournisseur';
  } else {
    return role === 'client';
  }
}

