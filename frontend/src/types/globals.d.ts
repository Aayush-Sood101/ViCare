import { UserRole } from './index';

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: UserRole;
    };
    publicMetadata?: {
      role?: UserRole;
    };
  }
}

export {};
