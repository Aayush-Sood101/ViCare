import { Request, Response, NextFunction } from 'express';
import { clerkClient, requireAuth } from '@clerk/express';
import { AuthUser, UserRole } from '../types';

// Extend Express Request to include auth info
declare global {
  namespace Express {
    interface Request {
      auth?: AuthUser;
    }
  }
}

// Middleware: Verify Clerk JWT and attach user info
export const clerkAuthMiddleware = [
  requireAuth(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore - Clerk adds auth to request
      const { userId } = req.auth;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Fetch user from Clerk to get metadata
      const user = await clerkClient.users.getUser(userId);
      const role = (user.publicMetadata?.role as UserRole) || 'patient';

      req.auth = {
        userId,
        email: user.emailAddresses[0]?.emailAddress || '',
        role,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      };

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  },
];

// Middleware: Check if user has required role(s)
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `Required role: ${allowedRoles.join(' or ')}. Your role: ${req.auth.role}`
      });
    }

    next();
  };
};

// Middleware: Allow only the resource owner or specific roles
export const requireOwnerOrRole = (
  getOwnerId: (req: Request) => string | Promise<string>,
  ...allowedRoles: UserRole[]
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Admin and specified roles always have access
    if (allowedRoles.includes(req.auth.role)) {
      return next();
    }

    try {
      const ownerId = await getOwnerId(req);
      if (req.auth.userId === ownerId) {
        return next();
      }
    } catch (error) {
      console.error('Owner check error:', error);
    }

    return res.status(403).json({ error: 'Access denied' });
  };
};
