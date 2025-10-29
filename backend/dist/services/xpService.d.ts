import { IXPCalculation } from '../types';
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
export declare class XPService {
    private static readonly XP_PER_LEVEL;
    private static readonly MAX_LEVEL;
    private static readonly BONUS_XP_MULTIPLIER;
    static calculateXPInfo(currentXP: number, currentLevel: number): IXPCalculation;
    static calculateTaskXP(completedTasks: string[]): number;
    private static calculateStreakBonus;
    static shouldLevelUp(currentXP: number, currentLevel: number): boolean;
    static calculateLevel(xp: number): number;
    static getLevelRewards(level: number): LevelReward[];
    static getAvailableAchievements(): Achievement[];
    static checkAchievements(userEmail: string, currentXP: number, currentLevel: number): Promise<Achievement[]>;
    private static checkWaterStreak;
    private static checkSleepStreak;
    private static checkPerfectWeek;
    private static checkConsistentGoals;
    private static checkStreak;
    private static checkDietDiversity;
    static getUserProgressSummary(userEmail: string): Promise<any>;
}
//# sourceMappingURL=xpService.d.ts.map