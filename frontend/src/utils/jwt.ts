// platform/frontend-mui/src/utils/jwt.ts
/**
 * JWT Utility Functions for Token Decoding
 * Extracts tenant information from JWT tokens
 */

interface JWTPayload {
  user_id: number;
  username: string;
  is_superuser: boolean;
  tenant_id: number;
  jti: string;
  iss: string;
  sub: string;
  exp: number;
  nbf: number;
  iat: number;
}

/**
 * Decode JWT token payload
 */
export const decodeJWTPayload = (token: string): JWTPayload | null => {
  try {
    // Remove Bearer prefix if present
    const cleanToken = token.replace(/^Bearer\s+/, '');
    
    // Split token into parts
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid JWT format');
      return null;
    }

    // Decode payload (second part)
    const payload = parts[1];
    const decoded = atob(payload);
    const parsed = JSON.parse(decoded);

    return parsed as JWTPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

/**
 * Extract tenant ID from JWT token
 */
export const extractTenantIdFromJWT = (token: string): number | null => {
  const payload = decodeJWTPayload(token);
  return payload?.tenant_id || null;
};

/**
 * Extract user ID from JWT token
 */
export const extractUserIdFromJWT = (token: string): number | null => {
  const payload = decodeJWTPayload(token);
  return payload?.user_id || null;
};

/**
 * Check if JWT token is expired
 */
export const isJWTExpired = (token: string): boolean => {
  const payload = decodeJWTPayload(token);
  if (!payload?.exp) return true;
  
  const currentTime = Date.now() / 1000;
  return payload.exp < currentTime;
};

/**
 * Get JWT expiry date
 */
export const getJWTExpiryDate = (token: string): Date | null => {
  const payload = decodeJWTPayload(token);
  if (!payload?.exp) return null;
  
  return new Date(payload.exp * 1000);
};

/**
 * Check if user is superuser from JWT
 */
export const isSuperuserFromJWT = (token: string): boolean => {
  const payload = decodeJWTPayload(token);
  return payload?.is_superuser || false;
};

/**
 * Get token info for debugging
 */
export const getJWTInfo = (token: string): any => {
  const payload = decodeJWTPayload(token);
  if (!payload) return null;
  
  return {
    userId: payload.user_id,
    username: payload.username,
    tenantId: payload.tenant_id,
    isSuperuser: payload.is_superuser,
    expiresAt: new Date(payload.exp * 1000),
    issuedAt: new Date(payload.iat * 1000),
    issuer: payload.iss,
    jti: payload.jti
  };
};