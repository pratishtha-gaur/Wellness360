import { Request, Response, NextFunction } from 'express';
import { UserProfile } from '@/models';
import { AppError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { ApiResponse, CreateUserProfileRequest, UpdateUserProfileRequest } from '@/types';

export class UserController {
  // Create a new user profile
  public static async createUserProfile(
    req: Request<{}, ApiResponse, CreateUserProfileRequest>,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, email, age, gender, weight, height, dietType, dailyCalorieTarget } = req.body;

      // Check if user already exists
      const existingUser = await UserProfile.findByEmail(email);
      if (existingUser) {
        throw new AppError('User profile already exists with this email', 409);
      }

      // Create new user profile
      const userProfile = new UserProfile({
        name,
        email,
        age,
        gender,
        weight,
        height,
        dietType,
        dailyCalorieTarget
      });

      await userProfile.save();

      logger.info(`New user profile created: ${email}`);

      res.status(201).json({
        success: true,
        message: 'User profile created successfully',
        data: userProfile
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user profile by email
  public static async getUserProfile(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.params;

      const userProfile = await UserProfile.findByEmail(email);
      if (!userProfile) {
        throw new AppError('User profile not found', 404);
      }

      res.json({
        success: true,
        message: 'User profile retrieved successfully',
        data: userProfile
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  public static async updateUserProfile(
    req: Request<{ email: string }, ApiResponse, UpdateUserProfileRequest>,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.params;
      const updateData = req.body;

      const userProfile = await UserProfile.findByEmail(email);
      if (!userProfile) {
        throw new AppError('User profile not found', 404);
      }

      // Update user profile
      const updatedProfile = await userProfile.updateProfile(updateData);

      logger.info(`User profile updated: ${email}`);

      res.json({
        success: true,
        message: 'User profile updated successfully',
        data: updatedProfile
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user profile
  public static async deleteUserProfile(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.params;

      const userProfile = await UserProfile.findByEmail(email);
      if (!userProfile) {
        throw new AppError('User profile not found', 404);
      }

      await UserProfile.findByIdAndDelete(userProfile._id);

      logger.info(`User profile deleted: ${email}`);

      res.json({
        success: true,
        message: 'User profile deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all user profiles (admin function)
  public static async getAllUserProfiles(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const userProfiles = await UserProfile.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await UserProfile.countDocuments();

      res.json({
        success: true,
        message: 'User profiles retrieved successfully',
        data: {
          userProfiles,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalUsers: total,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user profile statistics
  public static async getUserStats(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.params;

      const userProfile = await UserProfile.findByEmail(email);
      if (!userProfile) {
        throw new AppError('User profile not found', 404);
      }

      // Calculate BMI
      const heightInMeters = userProfile.height / 100;
      const bmi = Math.round((userProfile.weight / (heightInMeters * heightInMeters)) * 100) / 100;

      // BMI category
      let bmiCategory = '';
      if (bmi < 18.5) bmiCategory = 'Underweight';
      else if (bmi < 25) bmiCategory = 'Normal weight';
      else if (bmi < 30) bmiCategory = 'Overweight';
      else bmiCategory = 'Obese';

      res.json({
        success: true,
        message: 'User statistics retrieved successfully',
        data: {
          userProfile,
          statistics: {
            bmi,
            bmiCategory,
            age: userProfile.age,
            gender: userProfile.gender
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
