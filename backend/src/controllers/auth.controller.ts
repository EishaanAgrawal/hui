import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { notificationService } from '../services/notification.service';

export const registerConsumer = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return sendError(res, 'An account with this email already exists', 400, 'EMAIL_EXISTS');
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        phone,
        role: 'CONSUMER',
        isVerified: true,
        cart: { create: {} },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await notificationService.notify({
      userId: user.id,
      title: 'Welcome to FarmDirect!',
      message: 'Discover farm-fresh produce directly from local verified farmers.',
      type: 'ACCOUNT',
      link: '/shop',
    });

    return sendSuccess(
      res,
      { user, token },
      'Account created successfully',
      201
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to register consumer', 500);
  }
};

export const registerFarmer = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      name,
      email,
      password,
      phone,
      farmName,
      location,
      description,
      farmSize,
      farmingType,
      experienceYears,
    } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return sendError(res, 'An account with this email already exists', 400, 'EMAIL_EXISTS');
    }

    const passwordHash = await hashPassword(password);

    // Create user and linked farmer profile in a single transaction
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        phone,
        role: 'FARMER',
        isVerified: true,
        farmerProfile: {
          create: {
            farmName,
            location,
            description: description || `Welcome to ${farmName}, offering fresh and natural agricultural produce.`,
            farmSize: farmSize || '10 Acres',
            farmingType: farmingType || 'Organic & Natural',
            experienceYears: experienceYears ? (parseInt(String(experienceYears)) || 5) : 5,
            verificationStatus: 'VERIFIED', // Default verified for smooth demo experience
          },
        },
      },
      include: {
        farmerProfile: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      farmerId: user.farmerProfile?.id,
    });

    await notificationService.notify({
      userId: user.id,
      title: 'Farmer Account Created!',
      message: 'Your farm profile is active. You can now list fresh agricultural produce.',
      type: 'ACCOUNT',
      link: '/farmer/products/new',
    });

    await notificationService.notifyAdmin(
      'New Farmer Registration',
      `${farmName} (${name}) just registered on FarmDirect.`,
      '/admin/farmers'
    );

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          farmerProfile: user.farmerProfile,
        },
        token,
      },
      'Farmer account registered successfully',
      201
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to register farmer', 500);
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        farmerProfile: true,
      },
    });

    if (!user) {
      return sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated. Please contact support.', 403, 'ACCOUNT_DEACTIVATED');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      farmerId: user.farmerProfile?.id,
    });

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          farmerProfile: user.farmerProfile,
        },
        token,
      },
      'Logged in successfully'
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Login failed', 500);
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return sendError(res, 'Not authenticated', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        farmerProfile: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      farmerProfile: user.farmerProfile,
      addresses: user.addresses,
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch user', 500);
  }
};
