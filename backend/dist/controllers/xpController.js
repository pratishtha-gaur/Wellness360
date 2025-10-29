"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XPController = void 0;
const models_1 = require("../models");
const xpService_1 = require("../services/xpService");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
class XPController {
    static async getUserXPInfo(req, res, next) {
        try {
            const { email } = req.params;
            const userProfile = await models_1.UserProfile.findByEmail(email);
            if (!userProfile) {
                throw new errorHandler_1.AppError('User profile not found', 404);
            }
            const latestGoals = await models_1.DailyGoals.findOne({ userEmail: email })
                .sort({ date: -1 });
            if (!latestGoals) {
                throw new errorHandler_1.AppError('No goals found for user', 404);
            }
            const xpInfo = xpService_1.XPService.calculateXPInfo(latestGoals.xp, latestGoals.level);
            res.json({
                success: true,
                message: 'XP information retrieved successfully',
                data: xpInfo
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getUserProgressSummary(req, res, next) {
        try {
            const { email } = req.params;
            const userProfile = await models_1.UserProfile.findByEmail(email);
            if (!userProfile) {
                throw new errorHandler_1.AppError('User profile not found', 404);
            }
            const progressSummary = await xpService_1.XPService.getUserProgressSummary(email);
            logger_1.logger.info(`Progress summary retrieved for user: ${email}`);
            res.json({
                success: true,
                message: 'Progress summary retrieved successfully',
                data: progressSummary
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAvailableAchievements(req, res, next) {
        try {
            const achievements = xpService_1.XPService.getAvailableAchievements();
            res.json({
                success: true,
                message: 'Available achievements retrieved successfully',
                data: achievements
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async checkAchievements(req, res, next) {
        try {
            const { email } = req.params;
            const userProfile = await models_1.UserProfile.findByEmail(email);
            if (!userProfile) {
                throw new errorHandler_1.AppError('User profile not found', 404);
            }
            const latestGoals = await models_1.DailyGoals.findOne({ userEmail: email })
                .sort({ date: -1 });
            if (!latestGoals) {
                throw new errorHandler_1.AppError('No goals found for user', 404);
            }
            const achievements = await xpService_1.XPService.checkAchievements(email, latestGoals.xp, latestGoals.level);
            logger_1.logger.info(`Achievements checked for user: ${email}, unlocked: ${achievements.length}`);
            res.json({
                success: true,
                message: 'Achievements checked successfully',
                data: {
                    unlockedAchievements: achievements,
                    totalUnlocked: achievements.length
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getLevelRewards(req, res, next) {
        try {
            const { level } = req.params;
            const levelNumber = parseInt(level);
            if (isNaN(levelNumber) || levelNumber < 1 || levelNumber > 100) {
                throw new errorHandler_1.AppError('Invalid level number. Must be between 1 and 100', 400);
            }
            const rewards = xpService_1.XPService.getLevelRewards(levelNumber);
            res.json({
                success: true,
                message: 'Level rewards retrieved successfully',
                data: {
                    level: levelNumber,
                    rewards
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getLeaderboard(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const skip = (page - 1) * limit;
            const topUsers = await models_1.DailyGoals.aggregate([
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
            const totalUsers = await models_1.DailyGoals.distinct('userEmail').then(emails => emails.length);
            logger_1.logger.info(`Leaderboard retrieved: page ${page}, limit ${limit}`);
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
        }
        catch (error) {
            next(error);
        }
    }
    static async getXPHistory(req, res, next) {
        try {
            const { email } = req.params;
            const { days = 30 } = req.query;
            const userProfile = await models_1.UserProfile.findByEmail(email);
            if (!userProfile) {
                throw new errorHandler_1.AppError('User profile not found', 404);
            }
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - parseInt(days));
            const xpHistory = await models_1.DailyGoals.find({
                userEmail: email,
                date: { $gte: daysAgo }
            })
                .select('date xp level completedTasks')
                .sort({ date: -1 });
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
            logger_1.logger.info(`XP history retrieved for user: ${email}, days: ${days}`);
            res.json({
                success: true,
                message: 'XP history retrieved successfully',
                data: {
                    xpHistory: historyWithCumulative,
                    period: `${days} days`,
                    totalXP: cumulativeXP
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async addBonusXP(req, res, next) {
        try {
            const { email } = req.params;
            const { bonusXP, reason } = req.body;
            if (!bonusXP || bonusXP <= 0) {
                throw new errorHandler_1.AppError('Valid bonus XP amount is required', 400);
            }
            const latestGoals = await models_1.DailyGoals.findOne({ userEmail: email })
                .sort({ date: -1 });
            if (!latestGoals) {
                throw new errorHandler_1.AppError('No goals found for user', 404);
            }
            const newXP = latestGoals.xp + bonusXP;
            const newLevel = xpService_1.XPService.calculateLevel(newXP);
            latestGoals.xp = newXP;
            latestGoals.level = newLevel;
            await latestGoals.save();
            logger_1.logger.info(`Bonus XP added for user ${email}: +${bonusXP} (reason: ${reason || 'manual'})`);
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
        }
        catch (error) {
            next(error);
        }
    }
}
exports.XPController = XPController;
//# sourceMappingURL=xpController.js.map