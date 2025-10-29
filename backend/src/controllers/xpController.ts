import { Request, Response, NextFunction } from 'express';
import { DailyGoals, UserProfile } from '@/models';
import { XPService } from '@/services/xpService';
import { AppError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types';

export class XPController {
  // Get user's XP and level information
  public static async getUserXPInfo(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.params;

      // Check if user exists
      const userProfile = await UserProfile.findByEmail(email);
      if (!userProfile) {
        throw new AppError('User profile not found', 404);
      }

      // Get user's latest goals
      const latestGoals = await DailyGoals.findOne({ userEmail: email })
        .sort({ date: -1 });

      if (!latestGoals) {
        throw new AppError('No goals found for user', 404);
      }

      const xpInfo = XPService.calculateXPInfo(latestGoals.xp, latestGoals.level);

      res.json({
        success: true,
        message: 'XP information retrieved successfully',
        data: xpInfo
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user's progress summary
  public static async getUserProgressSummary(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.params;

      // Check if user exists
      const userProfile = await UserProfile.findByEmail(email);
      if (!userProfile) {
        throw new AppError('User profile not found', 404);
      }

      const progressSummary = await XPService.getUserProgressSummary(email);

      logger.info(`Progress summary retrieved for user: ${email}`);

      res.json({
        success: true,
        message: 'Progress summary retrieved successfully',
        data: progressSummary
      });
    } catch (error) {
      next(error);
    }
  }

  // Get available achievements
  public static async getAvailableAchievements(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const achievements = XPService.getAvailableAchievements();

      res.json({
        success: true,
        message: 'Available achievements retrieved successfully',
        data: achievements
      });
    } catch (error) {
      next(error);
    }
  }

  // Check and unlock achievements for a user
  public static async checkAchievements(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.params;

      // Check if user exists
      const userProfile = await UserProfile.findByEmail(email);
      if (!userProfile) {
        throw new AppError('User profile not found', 404);
      }

      // Get user's latest goals
      const latestGoals = await DailyGoals.findOne({ userEmail: email })
        .sort({ date: -1 });

      if (!latestGoals) {
        throw new AppError('No goals found for user', 404);
      }

      const achievements = await XPService.checkAchievements(
        email,
        latestGoals.xp,
        latestGoals.level
      );

      logger.info(`Achievements checked for user: ${email}, unlocked: ${achievements.length}`);

      res.json({
        success: true,
        message: 'Achievements checked successfully',
        data: {
          unlockedAchievements: achievements,
          totalUnlocked: achievements.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get level rewards for a specific level
  public static async getLevelRewards(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { level } = req.params;
      const levelNumber = parseInt(level);

      if (isNaN(levelNumber) || levelNumber < 1 || levelNumber > 100) {
        throw new AppError('Invalid level number. Must be between 1 and 100', 400);
      }

      const rewards = XPService.getLevelRewards(levelNumber);

      res.json({
        success: true,
        message: 'Level rewards retrieved successfully',
        data: {
          level: levelNumber,
          rewards
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get leaderboard (top users by XP)
  public static async getLeaderboard(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const page = parseInt(req.query.page as string) || 1;
      const skip = (page - 1) * limit;

      // Get top users by total XP
      const topUsers = await DailyGoals.aggregate([
        {
          $group: {
            _id: '$userEmail',
            totalXP: { $sum: '$xp' },
            currentLevel: { $max: '$level' },
            lastActive: { $max: '$date' }
          }
        },
        {
          $lookup: {
            from: 'userprofiles',
            localField: '_id',
            foreignField: 'email',
            as: 'userProfile'
          }
        },
        {
          $unwind: '$userProfile'
        },
        {
          $project: {
            email: '$_id',
            name: '$userProfile.name',
            totalXP: 1,
            currentLevel: 1,
            lastActive: 1,
            _id: 0
          }
        },
        {
          $sort: { totalXP: -1 }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        }
      ]);

      const totalUsers = await DailyGoals.distinct('userEmail').then(emails => emails.length);

      logger.info(`Leaderboard retrieved: page ${page}, limit ${limit}`);

      res.json({
        success: true,
        message: 'Leaderboard retrieved successfully',
        data: {
          leaderboard: topUsers,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers,
            hasNextPage: page < Math.ceil(totalUsers / limit),
            hasPrevPage: page > 1
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user's XP history
  public static async getXPHistory(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.params;
      const { days = 30 } = req.query;

      // Check if user exists
      const userProfile = await UserProfile.findByEmail(email);
      if (!userProfile) {
        throw new AppError('User profile not found', 404);
      }

      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));

      const xpHistory = await DailyGoals.find({
        userEmail: email,
        date: { $gte: daysAgo }
      })
        .select('date xp level completedTasks')
        .sort({ date: -1 });

      // Calculate cumulative XP
      let cumulativeXP = 0;
      const historyWithCumulative = xpHistory.map(goal => {
        cumulativeXP += goal.xp;
        return {
          date: goal.date,
          dailyXP: goal.xp,
          cumulativeXP,
          level: goal.level,
          completedTasks: goal.completedTasks
        };
      });

      logger.info(`XP history retrieved for user: ${email}, days: ${days}`);

      res.json({
        success: true,
        message: 'XP history retrieved successfully',
        data: {
          xpHistory: historyWithCumulative,
          period: `${days} days`,
          totalXP: cumulativeXP
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Add bonus XP to user
  public static async addBonusXP(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.params;
      const { bonusXP, reason } = req.body;

      if (!bonusXP || bonusXP <= 0) {
        throw new AppError('Valid bonus XP amount is required', 400);
      }

      // Get user's latest goals
      const latestGoals = await DailyGoals.findOne({ userEmail: email })
        .sort({ date: -1 });

      if (!latestGoals) {
        throw new AppError('No goals found for user', 404);
      }

      // Add bonus XP
      const newXP = latestGoals.xp + bonusXP;
      const newLevel = XPService.calculateLevel(newXP);

      latestGoals.xp = newXP;
      latestGoals.level = newLevel;
      await latestGoals.save();

      logger.info(`Bonus XP added for user ${email}: +${bonusXP} (reason: ${reason || 'manual'})`);

      res.json({
        success: true,
        message: 'Bonus XP added successfully',
        data: {
          previousXP: latestGoals.xp - bonusXP,
          newXP: latestGoals.xp,
          bonusXP,
          previousLevel: newLevel === latestGoals.level ? newLevel - 1 : newLevel,
          newLevel: latestGoals.level,
          reason: reason || 'manual'
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
