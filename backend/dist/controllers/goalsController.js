"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalsController = void 0;
const models_1 = require("../models");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
class GoalsController {
    static async createDailyGoals(req, res, next) {
        try {
            const { userEmail, waterIntake, sleepHours, dietType, dailyCalorieTarget } = req.body;
            const userProfile = await models_1.UserProfile.findByEmail(userEmail);
            if (!userProfile) {
                throw new errorHandler_1.AppError('User profile not found', 404);
            }
            const today = new Date();
            const existingGoals = await models_1.DailyGoals.findByUserAndDate(userEmail, today);
            if (existingGoals) {
                throw new errorHandler_1.AppError('Daily goals already exist for today', 409);
            }
            const dailyGoals = new models_1.DailyGoals({
                userEmail,
                waterIntake,
                sleepHours,
                dietType,
                dailyCalorieTarget,
                date: today
            });
            await dailyGoals.save();
            logger_1.logger.info(`Daily goals created for user: ${userEmail}`);
            res.status(201).json({
                success: true,
                message: 'Daily goals created successfully',
                data: dailyGoals
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getDailyGoals(req, res, next) {
        try {
            const { email } = req.params;
            const { date } = req.query;
            const targetDate = date ? new Date(date) : new Date();
            const dailyGoals = await models_1.DailyGoals.findByUserAndDate(email, targetDate);
            if (!dailyGoals) {
                throw new errorHandler_1.AppError('Daily goals not found for the specified date', 404);
            }
            res.json({
                success: true,
                message: 'Daily goals retrieved successfully',
                data: dailyGoals
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateDailyGoals(req, res, next) {
        try {
            const { email } = req.params;
            const updateData = req.body;
            const { date } = req.query;
            const targetDate = date ? new Date(date) : new Date();
            const dailyGoals = await models_1.DailyGoals.findByUserAndDate(email, targetDate);
            if (!dailyGoals) {
                throw new errorHandler_1.AppError('Daily goals not found for the specified date', 404);
            }
            Object.assign(dailyGoals, updateData);
            await dailyGoals.save();
            logger_1.logger.info(`Daily goals updated for user: ${email}`);
            res.json({
                success: true,
                message: 'Daily goals updated successfully',
                data: dailyGoals
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async addCompletedTask(req, res, next) {
        try {
            const { email } = req.params;
            const { taskName } = req.body;
            const { date } = req.query;
            if (!taskName) {
                throw new errorHandler_1.AppError('Task name is required', 400);
            }
            const targetDate = date ? new Date(date) : new Date();
            const dailyGoals = await models_1.DailyGoals.findByUserAndDate(email, targetDate);
            if (!dailyGoals) {
                throw new errorHandler_1.AppError('Daily goals not found for the specified date', 404);
            }
            await dailyGoals.addCompletedTask(taskName);
            logger_1.logger.info(`Task completed for user ${email}: ${taskName}`);
            res.json({
                success: true,
                message: 'Task marked as completed successfully',
                data: dailyGoals
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async removeCompletedTask(req, res, next) {
        try {
            const { email } = req.params;
            const { taskName } = req.body;
            const { date } = req.query;
            if (!taskName) {
                throw new errorHandler_1.AppError('Task name is required', 400);
            }
            const targetDate = date ? new Date(date) : new Date();
            const dailyGoals = await models_1.DailyGoals.findByUserAndDate(email, targetDate);
            if (!dailyGoals) {
                throw new errorHandler_1.AppError('Daily goals not found for the specified date', 404);
            }
            await dailyGoals.removeCompletedTask(taskName);
            logger_1.logger.info(`Task removed for user ${email}: ${taskName}`);
            res.json({
                success: true,
                message: 'Task removed from completed list successfully',
                data: dailyGoals
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getUserXPStats(req, res, next) {
        try {
            const { email } = req.params;
            const userStats = await models_1.DailyGoals.getUserStats(email);
            if (!userStats) {
                throw new errorHandler_1.AppError('User statistics not found', 404);
            }
            const xpCalculation = {
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
        }
        catch (error) {
            next(error);
        }
    }
    static async getGoalHistory(req, res, next) {
        try {
            const { email } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 30;
            const skip = (page - 1) * limit;
            const goalHistory = await models_1.DailyGoals.find({ userEmail: email })
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit);
            const total = await models_1.DailyGoals.countDocuments({ userEmail: email });
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
        }
        catch (error) {
            next(error);
        }
    }
    static async resetDailyGoals(req, res, next) {
        try {
            const { email } = req.params;
            const { date } = req.query;
            const targetDate = date ? new Date(date) : new Date();
            const dailyGoals = await models_1.DailyGoals.findByUserAndDate(email, targetDate);
            if (!dailyGoals) {
                throw new errorHandler_1.AppError('Daily goals not found for the specified date', 404);
            }
            await dailyGoals.resetDailyGoals();
            logger_1.logger.info(`Daily goals reset for user: ${email}`);
            res.json({
                success: true,
                message: 'Daily goals reset successfully',
                data: dailyGoals
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.GoalsController = GoalsController;
//# sourceMappingURL=goalsController.js.map