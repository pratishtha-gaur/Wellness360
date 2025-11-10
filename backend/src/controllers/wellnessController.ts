import { Request, Response, NextFunction } from 'express';
import { UserProfile, DailyGoals } from '@/models';
import { aiService } from '@/services/aiService';
import { AppError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { ApiResponse, IWellnessPlan, IMealWorkoutPlan } from '@/types';

export class WellnessController {
  // Generate personalized wellness plan
  public static async generateWellnessPlan(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.params;
      const { date } = req.query;

      // Get user profile
      const userProfile = await UserProfile.findByEmail(email);
      if (!userProfile) {
        throw new AppError('User profile not found', 404);
      }

      // Get daily goals for the specified date or today
      const targetDate = date ? new Date(date as string) : new Date();
      const dailyGoals = await DailyGoals.findByUserAndDate(email, targetDate);
      if (!dailyGoals) {
        throw new AppError('Daily goals not found for the specified date', 404);
      }

      // Check if AI service is available
      const isAIAvailable = await aiService.isAvailable();
      if (!isAIAvailable) {
        throw new AppError('AI service is currently unavailable', 503);
      }

      // Generate wellness plan
      const wellnessPlan: IWellnessPlan = await aiService.generateWellnessPlan(
        userProfile,
        dailyGoals
      );

      logger.info(`Wellness plan generated for user: ${email}`);

      res.json({
        success: true,
        message: 'Personalized wellness plan generated successfully',
        data: wellnessPlan
      });
    } catch (error) {
      next(error);
    }
  }

  // Get quick wellness tips for a specific category
  public static async getQuickTips(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.params;
      const { category } = req.query;

      if (!category || !['diet', 'exercise', 'sleep', 'hydration', 'general'].includes(category as string)) {
        throw new AppError('Valid category is required (diet, exercise, sleep, hydration, general)', 400);
      }

      // Get user profile
      const userProfile = await UserProfile.findByEmail(email);
      if (!userProfile) {
        throw new AppError('User profile not found', 404);
      }

      // Get latest daily goals
      const dailyGoals = await DailyGoals.findOne({ userEmail: email })
        .sort({ date: -1 });
      if (!dailyGoals) {
        throw new AppError('Daily goals not found', 404);
      }

      // Check if AI service is available
      const isAIAvailable = await aiService.isAvailable();
      if (!isAIAvailable) {
        throw new AppError('AI service is currently unavailable', 503);
      }

      // Generate quick tips
      const tips = await aiService.generateQuickTips(
        userProfile,
        dailyGoals,
        category as 'diet' | 'exercise' | 'sleep' | 'hydration' | 'general'
      );

      logger.info(`Quick tips generated for user ${email}, category: ${category}`);

      res.json({
        success: true,
        message: `Quick ${category} tips generated successfully`,
        data: {
          category,
          tips,
          generatedAt: new Date()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get wellness insights based on user's progress
  public static async getWellnessInsights(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.params;
      const { days = 7 } = req.query;

      // Get user profile
      const userProfile = await UserProfile.findByEmail(email);
      if (!userProfile) {
        throw new AppError('User profile not found', 404);
      }

      // Get recent daily goals
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));

      const recentGoals = await DailyGoals.find({
        userEmail: email,
        date: { $gte: daysAgo }
      }).sort({ date: -1 });

      if (recentGoals.length === 0) {
        throw new AppError('No recent goals found for analysis', 404);
      }

      // Calculate insights
      const totalXP = recentGoals.reduce((sum, goal) => sum + goal.xp, 0);
      const averageWaterIntake = recentGoals.reduce((sum, goal) => sum + goal.waterIntake, 0) / recentGoals.length;
      const averageSleepHours = recentGoals.reduce((sum, goal) => sum + goal.sleepHours, 0) / recentGoals.length;
      const averageCalories = recentGoals.reduce((sum, goal) => sum + goal.dailyCalorieTarget, 0) / recentGoals.length;
      const totalCompletedTasks = recentGoals.reduce((sum, goal) => sum + goal.completedTasks.length, 0);

      // Calculate consistency score
      const consistencyScore = Math.round((totalCompletedTasks / (recentGoals.length * 4)) * 100);

      // Generate insights
      const insights = {
        period: `${days} days`,
        totalXP,
        averageWaterIntake: Math.round(averageWaterIntake * 10) / 10,
        averageSleepHours: Math.round(averageSleepHours * 10) / 10,
        averageCalories: Math.round(averageCalories),
        totalCompletedTasks,
        consistencyScore,
        recommendations: this.generateRecommendations(
          averageWaterIntake,
          averageSleepHours,
          consistencyScore,
          userProfile
        ),
        trends: this.analyzeTrends(recentGoals)
      };

      logger.info(`Wellness insights generated for user: ${email}`);

      res.json({
        success: true,
        message: 'Wellness insights generated successfully',
        data: insights
      });
    } catch (error) {
      next(error);
    }
  }

  // Get personalized meal and workout plan
  public static async getMealWorkoutPlan(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.params;

      // Get user profile
      let userProfile = await UserProfile.findByEmail(email);
      
      // If user profile doesn't exist, create a default one
      if (!userProfile) {
        logger.warn(`User profile not found for ${email}, creating default profile`);
        // Create a minimal user profile with defaults
        userProfile = new UserProfile({
          name: email.split('@')[0] || 'User',
          email: email,
          age: 25,
          gender: 'male',
          weight: 70,
          height: 175,
          dietType: 'balanced',
          dailyCalorieTarget: 2000
        });
        await userProfile.save();
      }

      // Get daily goals for today (optional, to use latest goals if available)
      const dailyGoals = await DailyGoals.findByUserAndDate(email, new Date());

      // Use daily goals or fallback to user profile defaults
      const dietType = dailyGoals?.dietType || userProfile.dietType || 'balanced';
      const dailyCalorieTarget = dailyGoals?.dailyCalorieTarget || userProfile.dailyCalorieTarget || 2000;

      // Generate meal and workout plan (service handles timeout and fallback internally)
      const mealWorkoutPlan: IMealWorkoutPlan = await aiService.generateMealWorkoutPlan(
        userProfile,
        dailyCalorieTarget,
        dietType
      );

      // Log whether AI was used or fallback
      const usedAI = mealWorkoutPlan.generatedAt && 
        (mealWorkoutPlan.meals.length > 0 && 
         mealWorkoutPlan.meals[0].name !== 'Oatmeal with berries & almonds'); // Simple check for AI vs fallback
      
      logger.info(`Meal and workout plan generated for user: ${email} (${usedAI ? 'AI-generated' : 'fallback'})`);
      logger.info(`Plan details: generatedAt=${mealWorkoutPlan.generatedAt}, meals count=${mealWorkoutPlan.meals.length}, first meal=${mealWorkoutPlan.meals[0]?.name || 'N/A'}, isAIGenerated=${usedAI}`);

      res.json({
        success: true,
        message: 'Meal and workout plan generated successfully',
        data: {
          ...mealWorkoutPlan,
          isAIGenerated: usedAI
        }
      });
    } catch (error) {
      logger.error('Error generating meal/workout plan:', error);
      next(error);
    }
  }

  // Check AI service status
  public static async getAIServiceStatus(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const apiKey = process.env.GOOGLE_API_KEY;
      const isAvailable = await aiService.isAvailable();

      res.json({
        success: true,
        message: 'AI service status retrieved successfully',
        data: {
          available: isAvailable,
          apiKeyConfigured: !!apiKey && apiKey.trim().length > 0,
          apiKeyLength: apiKey ? apiKey.length : 0,
          apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'N/A',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Private helper methods
  private static generateRecommendations(
    avgWater: number,
    avgSleep: number,
    consistency: number,
    userProfile: any
  ): string[] {
    const recommendations = [];

    if (avgWater < 2) {
      recommendations.push('Consider increasing your daily water intake to at least 2 liters');
    }
    if (avgSleep < 7) {
      recommendations.push('Aim for 7-9 hours of sleep nightly for optimal health');
    }
    if (consistency < 50) {
      recommendations.push('Try to maintain more consistent daily habits');
    }
    if (consistency > 80) {
      recommendations.push('Great job maintaining consistent habits! Keep it up!');
    }

    return recommendations;
  }

  private static analyzeTrends(goals: any[]): any {
    if (goals.length < 2) {
      return { message: 'Not enough data to analyze trends' };
    }

    const waterTrend = goals[0].waterIntake > goals[goals.length - 1].waterIntake ? 'increasing' : 'decreasing';
    const sleepTrend = goals[0].sleepHours > goals[goals.length - 1].sleepHours ? 'increasing' : 'decreasing';
    const xpTrend = goals[0].xp > goals[goals.length - 1].xp ? 'increasing' : 'decreasing';

    return {
      waterIntake: waterTrend,
      sleepHours: sleepTrend,
      xp: xpTrend,
      overall: xpTrend === 'increasing' ? 'improving' : 'needs attention'
    };
  }
}
