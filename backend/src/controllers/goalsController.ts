import { Request, Response, NextFunction } from 'express';
import { DailyGoals, UserProfile } from '@/models';
import { AppError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { ApiResponse, CreateDailyGoalsRequest, UpdateDailyGoalsRequest, IXPCalculation } from '@/types';

export class GoalsController {
  // Create daily goals for a user
  public static async createDailyGoals(
    req: Request<{}, ApiResponse, CreateDailyGoalsRequest>,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userEmail, waterIntake, sleepHours, dietType, dailyCalorieTarget } = req.body;

      // Check if user exists
      const userProfile = await UserProfile.findByEmail(userEmail);
      if (!userProfile) {
        throw new AppError('User profile not found', 404);
      }

      // Check if goals already exist for today
      const today = new Date();
      const existingGoals = await DailyGoals.findByUserAndDate(userEmail, today);
      if (existingGoals) {
        throw new AppError('Daily goals already exist for today', 409);
      }

      // Create new daily goals
      const dailyGoals = new DailyGoals({
        userEmail,
        waterIntake,
        sleepHours,
        dietType,
        dailyCalorieTarget,
        date: today,
        plannedTasks: [],
        completedTasks: []
      });

      await dailyGoals.save();

      logger.info(`Daily goals created for user: ${userEmail}`);

      res.status(201).json({
        success: true,
        message: 'Daily goals created successfully',
        data: dailyGoals
      });
    } catch (error) {
      next(error);
    }
  }

  // Get daily goals for a user by date
  public static async getDailyGoals(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.params;
      const { date } = req.query;

      const targetDate = date ? new Date(date as string) : new Date();
      const dailyGoals = await DailyGoals.findByUserAndDate(email, targetDate);

      if (!dailyGoals) {
        throw new AppError('Daily goals not found for the specified date', 404);
      }

      res.json({
        success: true,
        message: 'Daily goals retrieved successfully',
        data: dailyGoals
      });
    } catch (error) {
      next(error);
    }
  }

  // Update daily goals
  public static async updateDailyGoals(
    req: Request<{ email: string }, ApiResponse, UpdateDailyGoalsRequest>,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.params;
      const updateData = req.body as Partial<UpdateDailyGoalsRequest> & { plannedTasks?: string[]; completedTasks?: string[] };
      const { date } = req.query;

      const targetDate = date ? new Date(date as string) : new Date();
      const dailyGoals = await DailyGoals.findByUserAndDate(email, targetDate);

      if (!dailyGoals) {
        throw new AppError('Daily goals not found for the specified date', 404);
      }

      // Update daily goals including planned/completed tasks
      if (typeof updateData.waterIntake !== 'undefined') dailyGoals.waterIntake = updateData.waterIntake as number;
      if (typeof updateData.sleepHours !== 'undefined') dailyGoals.sleepHours = updateData.sleepHours as number;
      if (typeof updateData.dietType !== 'undefined') dailyGoals.dietType = updateData.dietType as any;
      if (typeof updateData.dailyCalorieTarget !== 'undefined') dailyGoals.dailyCalorieTarget = updateData.dailyCalorieTarget as number;
      if (Array.isArray((updateData as any).plannedTasks)) dailyGoals.plannedTasks = (updateData as any).plannedTasks as string[];
      if (Array.isArray(updateData.completedTasks)) dailyGoals.completedTasks = updateData.completedTasks;
      await dailyGoals.save();

      logger.info(`Daily goals updated for user: ${email}`);

      res.json({
        success: true,
        message: 'Daily goals updated successfully',
        data: dailyGoals
      });
    } catch (error) {
      next(error);
    }
  }

  // Add completed task
  public static async addCompletedTask(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.params;
      const { taskName } = req.body;
      const { date } = req.query;

      if (!taskName) {
        throw new AppError('Task name is required', 400);
      }

      const targetDate = date ? new Date(date as string) : new Date();
      const dailyGoals = await DailyGoals.findByUserAndDate(email, targetDate);

      if (!dailyGoals) {
        throw new AppError('Daily goals not found for the specified date', 404);
      }

      await dailyGoals.addCompletedTask(taskName);

      logger.info(`Task completed for user ${email}: ${taskName}`);

      res.json({
        success: true,
        message: 'Task marked as completed successfully',
        data: dailyGoals
      });
    } catch (error) {
      next(error);
    }
  }

  // Remove completed task
  public static async removeCompletedTask(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.params;
      const { taskName } = req.body;
      const { date } = req.query;

      if (!taskName) {
        throw new AppError('Task name is required', 400);
      }

      const targetDate = date ? new Date(date as string) : new Date();
      const dailyGoals = await DailyGoals.findByUserAndDate(email, targetDate);

      if (!dailyGoals) {
        throw new AppError('Daily goals not found for the specified date', 404);
      }

      await dailyGoals.removeCompletedTask(taskName);

      logger.info(`Task removed for user ${email}: ${taskName}`);

      res.json({
        success: true,
        message: 'Task removed from completed list successfully',
        data: dailyGoals
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user's XP and level statistics
  public static async getUserXPStats(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.params;

      const userStats = await DailyGoals.getUserStats(email);
      if (!userStats) {
        throw new AppError('User statistics not found', 404);
      }

      const xpCalculation: IXPCalculation = {
        currentLevel: userStats.level,
        currentXP: userStats.xp,
        xpToNextLevel: userStats.level * 100 - userStats.xp,
        totalXPForCurrentLevel: userStats.level * 100,
        progressPercentage: Math.round(((userStats.xp % 100) / 100) * 100)
      };

      res.json({
        success: true,
        message: 'User XP statistics retrieved successfully',
        data: {
          xpStats: xpCalculation,
          completedTasks: userStats.completedTasks
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user's goal history
  public static async getGoalHistory(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 30;
      const skip = (page - 1) * limit;

      const goalHistory = await DailyGoals.find({ userEmail: email })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);

      const total = await DailyGoals.countDocuments({ userEmail: email });

      res.json({
        success: true,
        message: 'Goal history retrieved successfully',
        data: {
          goalHistory,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalGoals: total,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Reset daily goals
  public static async resetDailyGoals(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.params;
      const { date } = req.query;

      const targetDate = date ? new Date(date as string) : new Date();
      const dailyGoals = await DailyGoals.findByUserAndDate(email, targetDate);

      if (!dailyGoals) {
        throw new AppError('Daily goals not found for the specified date', 404);
      }

      await dailyGoals.resetDailyGoals();

      logger.info(`Daily goals reset for user: ${email}`);

      res.json({
        success: true,
        message: 'Daily goals reset successfully',
        data: dailyGoals
      });
    } catch (error) {
      next(error);
    }
  }
}
