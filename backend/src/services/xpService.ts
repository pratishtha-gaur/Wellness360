import { DailyGoals } from '@/models';
import { logger } from '@/utils/logger';
import { IXPCalculation } from '@/types';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: Date;
}

export interface LevelReward {
  level: number;
  title: string;
  description: string;
  benefits: string[];
  xpRequired: number;
}

export class XPService {
  private static readonly XP_PER_LEVEL = 100;
  private static readonly MAX_LEVEL = 100;
  private static readonly BONUS_XP_MULTIPLIER = 1.5;

  // Calculate XP and level information
  public static calculateXPInfo(currentXP: number, currentLevel: number): IXPCalculation {
    const xpForCurrentLevel = (currentLevel - 1) * this.XP_PER_LEVEL;
    const xpForNextLevel = currentLevel * this.XP_PER_LEVEL;
    const xpToNextLevel = Math.max(0, xpForNextLevel - currentXP);
    const progressPercentage = Math.round(((currentXP - xpForCurrentLevel) / this.XP_PER_LEVEL) * 100);

    return {
      currentLevel,
      currentXP,
      xpToNextLevel,
      totalXPForCurrentLevel: xpForNextLevel,
      progressPercentage: Math.min(100, Math.max(0, progressPercentage))
    };
  }

  // Calculate XP for completed tasks
  public static calculateTaskXP(completedTasks: string[]): number {
    const baseXP = 10; // Base XP per task
    const bonusXP = completedTasks.length > 2 ? 5 : 0; // Bonus for multiple tasks
    const streakBonus = this.calculateStreakBonus(completedTasks.length);
    
    return (completedTasks.length * baseXP) + bonusXP + streakBonus;
  }

  // Calculate streak bonus
  private static calculateStreakBonus(taskCount: number): number {
    if (taskCount >= 4) return 20; // Perfect day bonus
    if (taskCount >= 3) return 10; // Great day bonus
    if (taskCount >= 2) return 5;  // Good day bonus
    return 0;
  }

  // Check if user should level up
  public static shouldLevelUp(currentXP: number, currentLevel: number): boolean {
    const xpForNextLevel = currentLevel * this.XP_PER_LEVEL;
    return currentXP >= xpForNextLevel && currentLevel < this.MAX_LEVEL;
  }

  // Calculate new level based on XP
  public static calculateLevel(xp: number): number {
    return Math.min(Math.floor(xp / this.XP_PER_LEVEL) + 1, this.MAX_LEVEL);
  }

  // Get level rewards
  public static getLevelRewards(level: number): LevelReward[] {
    const rewards: LevelReward[] = [];
    
    // Every 5 levels, give a special reward
    if (level % 5 === 0) {
      rewards.push({
        level,
        title: `Level ${level} Master`,
        description: `Congratulations! You've reached level ${level}!`,
        benefits: [
          'Unlocked advanced wellness tracking',
          'Access to premium AI recommendations',
          'Exclusive achievement badges',
          'Priority support'
        ],
        xpRequired: level * this.XP_PER_LEVEL
      });
    }

    // Every 10 levels, give a major reward
    if (level % 10 === 0) {
      rewards.push({
        level,
        title: `Wellness Champion Level ${level}`,
        description: `Amazing! You've reached the prestigious level ${level}!`,
        benefits: [
          'Unlocked all premium features',
          'Personal wellness coach access',
          'Custom meal plan generation',
          'Advanced analytics dashboard',
          'Exclusive community access'
        ],
        xpRequired: level * this.XP_PER_LEVEL
      });
    }

    return rewards;
  }

  // Get available achievements
  public static getAvailableAchievements(): Achievement[] {
    return [
      {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Complete your first wellness task',
        icon: '👶',
        xpReward: 25
      },
      {
        id: 'water_master',
        name: 'Hydration Master',
        description: 'Drink 2+ liters of water for 7 consecutive days',
        icon: '💧',
        xpReward: 100
      },
      {
        id: 'sleep_champion',
        name: 'Sleep Champion',
        description: 'Get 7+ hours of sleep for 14 consecutive days',
        icon: '😴',
        xpReward: 150
      },
      {
        id: 'perfect_week',
        name: 'Perfect Week',
        description: 'Complete all daily goals for 7 consecutive days',
        icon: '⭐',
        xpReward: 200
      },
      {
        id: 'monthly_warrior',
        name: 'Monthly Warrior',
        description: 'Maintain consistent goals for 30 days',
        icon: '🏆',
        xpReward: 500
      },
      {
        id: 'level_10',
        name: 'Rising Star',
        description: 'Reach level 10',
        icon: '🌟',
        xpReward: 100
      },
      {
        id: 'level_25',
        name: 'Wellness Expert',
        description: 'Reach level 25',
        icon: '🎯',
        xpReward: 250
      },
      {
        id: 'level_50',
        name: 'Wellness Master',
        description: 'Reach level 50',
        icon: '👑',
        xpReward: 500
      },
      {
        id: 'streak_100',
        name: 'Century Streak',
        description: 'Maintain a 100-day streak',
        icon: '💯',
        xpReward: 1000
      },
      {
        id: 'diet_diverse',
        name: 'Diet Diversity',
        description: 'Try all 7 different diet types',
        icon: '🥗',
        xpReward: 300
      }
    ];
  }

  // Check and unlock achievements
  public static async checkAchievements(
    userEmail: string,
    currentXP: number,
    currentLevel: number
  ): Promise<Achievement[]> {
    try {
      const achievements = this.getAvailableAchievements();
      const unlockedAchievements: Achievement[] = [];

      // Get user's recent activity
      const recentGoals = await DailyGoals.find({ userEmail })
        .sort({ date: -1 })
        .limit(30);

      if (recentGoals.length === 0) return unlockedAchievements;

      // Check each achievement
      for (const achievement of achievements) {
        let shouldUnlock = false;

        switch (achievement.id) {
          case 'first_steps':
            shouldUnlock = currentXP >= 25;
            break;

          case 'water_master':
            shouldUnlock = this.checkWaterStreak(recentGoals, 7, 2);
            break;

          case 'sleep_champion':
            shouldUnlock = this.checkSleepStreak(recentGoals, 14, 7);
            break;

          case 'perfect_week':
            shouldUnlock = this.checkPerfectWeek(recentGoals, 7);
            break;

          case 'monthly_warrior':
            shouldUnlock = this.checkConsistentGoals(recentGoals, 30);
            break;

          case 'level_10':
            shouldUnlock = currentLevel >= 10;
            break;

          case 'level_25':
            shouldUnlock = currentLevel >= 25;
            break;

          case 'level_50':
            shouldUnlock = currentLevel >= 50;
            break;

          case 'streak_100':
            shouldUnlock = this.checkStreak(recentGoals, 100);
            break;

          case 'diet_diverse':
            shouldUnlock = this.checkDietDiversity(recentGoals);
            break;
        }

        if (shouldUnlock) {
          unlockedAchievements.push({
            ...achievement,
            unlockedAt: new Date()
          });
        }
      }

      return unlockedAchievements;

    } catch (error) {
      logger.error('Error checking achievements:', error);
      return [];
    }
  }

  // Helper methods for achievement checking
  private static checkWaterStreak(goals: any[], days: number, minLiters: number): boolean {
    if (goals.length < days) return false;
    
    const recentGoals = goals.slice(0, days);
    return recentGoals.every(goal => goal.waterIntake >= minLiters);
  }

  private static checkSleepStreak(goals: any[], days: number, minHours: number): boolean {
    if (goals.length < days) return false;
    
    const recentGoals = goals.slice(0, days);
    return recentGoals.every(goal => goal.sleepHours >= minHours);
  }

  private static checkPerfectWeek(goals: any[], days: number): boolean {
    if (goals.length < days) return false;
    
    const recentGoals = goals.slice(0, days);
    return recentGoals.every(goal => goal.completedTasks.length >= 4);
  }

  private static checkConsistentGoals(goals: any[], days: number): boolean {
    if (goals.length < days) return false;
    
    const recentGoals = goals.slice(0, days);
    const consistentDays = recentGoals.filter(goal => goal.completedTasks.length >= 2).length;
    return consistentDays >= days * 0.8; // 80% consistency
  }

  private static checkStreak(goals: any[], days: number): boolean {
    if (goals.length < days) return false;
    
    const recentGoals = goals.slice(0, days);
    return recentGoals.every(goal => goal.completedTasks.length >= 2);
  }

  private static checkDietDiversity(goals: any[]): boolean {
    const dietTypes = new Set(goals.map(goal => goal.dietType));
    return dietTypes.size >= 7;
  }

  // Get user's progress summary
  public static async getUserProgressSummary(userEmail: string): Promise<any> {
    try {
      const recentGoals = await DailyGoals.find({ userEmail })
        .sort({ date: -1 })
        .limit(30);

      if (recentGoals.length === 0) {
        return {
          totalXP: 0,
          currentLevel: 1,
          streak: 0,
          achievements: [],
          weeklyProgress: 0,
          monthlyProgress: 0
        };
      }

      const totalXP = recentGoals.reduce((sum, goal) => sum + goal.xp, 0);
      const currentLevel = this.calculateLevel(totalXP);
      const xpInfo = this.calculateXPInfo(totalXP, currentLevel);
      const achievements = await this.checkAchievements(userEmail, totalXP, currentLevel);
      
      // Calculate streak
      let streak = 0;
      for (let i = 0; i < recentGoals.length; i++) {
        if (recentGoals[i].completedTasks.length >= 2) {
          streak++;
        } else {
          break;
        }
      }

      // Calculate weekly and monthly progress
      const weeklyGoals = recentGoals.slice(0, 7);
      const monthlyGoals = recentGoals.slice(0, 30);
      
      const weeklyProgress = weeklyGoals.length > 0 
        ? Math.round((weeklyGoals.filter(g => g.completedTasks.length >= 2).length / weeklyGoals.length) * 100)
        : 0;
      
      const monthlyProgress = monthlyGoals.length > 0
        ? Math.round((monthlyGoals.filter(g => g.completedTasks.length >= 2).length / monthlyGoals.length) * 100)
        : 0;

      return {
        totalXP,
        currentLevel,
        xpInfo,
        streak,
        achievements,
        weeklyProgress,
        monthlyProgress,
        levelRewards: this.getLevelRewards(currentLevel)
      };

    } catch (error) {
      logger.error('Error getting user progress summary:', error);
      throw error;
    }
  }
}
