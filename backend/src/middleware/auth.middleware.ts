import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { sendError } from '../utils/response';
import { prisma } from '../config/database';

export interface AuthRequest extends Request {
  user?: TokenPayload & { name?: string };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token missing or invalid', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { farmerProfile: true },
    });

    if (!user || !user.isActive) {
      return sendError(res, 'User account is invalid or suspended', 401, 'USER_INACTIVE');
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      farmerId: user.farmerProfile?.id,
    };

    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired session token', 401, 'INVALID_TOKEN');
  }
};

export const optionalAuthenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { farmerProfile: true },
      });
      if (user && user.isActive) {
        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          farmerId: user.farmerProfile?.id,
        };
      }
    }
  } catch {
    // Ignore optional auth error
  }
  next();
};
