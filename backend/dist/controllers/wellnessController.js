"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WellnessController = void 0;
const models_1 = require("../models");
const aiService_1 = require("../services/aiService");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
class WellnessController {
    static async generateWellnessPlan(req, res, next) {
        try {
            const { email } = req.params;
            const { date } = req.query;
            const userProfile = await models_1.UserProfile.findByEmail(email);
            if (!userProfile) {
                throw new errorHandler_1.AppError('User profile not found', 404);
            }
            const targetDate = date ? new Date(date) : new Date();
            const dailyGoals = await models_1.DailyGoals.findByUserAndDate(email, targetDate);
            if (!dailyGoals) {
                throw new errorHandler_1.AppError('Daily goals not found for the specified date', 404);
            }
            const isAIAvailable = await aiService_1.aiService.isAvailable();
            if (!isAIAvailable) {
                throw new errorHandler_1.AppError('AI service is currently unavailable', 503);
            }
            const wellnessPlan = await aiService_1.aiService.generateWellnessPlan(userProfile, dailyGoals);
            logger_1.logger.info(`Wellness plan generated for user: ${email}`);
            res.json({
                success: true,
                message: 'Personalized wellness plan generated successfully',
                data: wellnessPlan
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getQuickTips(req, res, next) {
        try {
            const { email } = req.params;
            const { category } = req.query;
            if (!category || !['diet', 'exercise', 'sleep', 'hydration', 'general'].includes(category)) {
                throw new errorHandler_1.AppError('Valid category is required (diet, exercise, sleep, hydration, general)', 400);
            }
            const userProfile = await models_1.UserProfile.findByEmail(email);
            if (!userProfile) {
                throw new errorHandler_1.AppError('User profile not found', 404);
            }
            const dailyGoals = await models_1.DailyGoals.findOne({ userEmail: email })
                .sort({ date: -1 });
            if (!dailyGoals) {
                throw new errorHandler_1.AppError('Daily goals not found', 404);
            }
            const isAIAvailable = await aiService_1.aiService.isAvailable();
            if (!isAIAvailable) {
                throw new errorHandler_1.AppError('AI service is currently unavailable', 503);
            }
            const tips = await aiService_1.aiService.generateQuickTips(userProfile, dailyGoals, category);
            logger_1.logger.info(`Quick tips generated for user ${email}, category: ${category}`);
            res.json({
                success: true,
                message: `Quick ${category} tips generated successfully`,
                data: {
                    category,
                    tips,
                    generatedAt: new Date()
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getWellnessInsights(req, res, next) {
        try {
            const { email } = req.params;
            const { days = 7 } = req.query;
            const userProfile = await models_1.UserProfile.findByEmail(email);
            if (!userProfile) {
                throw new errorHandler_1.AppError('User profile not found', 404);
            }
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - parseInt(days));
            const recentGoals = await models_1.DailyGoals.find({
                userEmail: email,
                date: { $gte: daysAgo }
            }).sort({ date: -1 });
            if (recentGoals.length === 0) {
                throw new errorHandler_1.AppError('No recent goals found for analysis', 404);
            }
            const totalXP = recentGoals.reduce((sum, goal) => sum + goal.xp, 0);
            const averageWaterIntake = recentGoals.reduce((sum, goal) => sum + goal.waterIntake, 0) / recentGoals.length;
            const averageSleepHours = recentGoals.reduce((sum, goal) => sum + goal.sleepHours, 0) / recentGoals.length;
            const averageCalories = recentGoals.reduce((sum, goal) => sum + goal.dailyCalorieTarget, 0) / recentGoals.length;
            const totalCompletedTasks = recentGoals.reduce((sum, goal) => sum + goal.completedTasks.length, 0);
            const consistencyScore = Math.round((totalCompletedTasks / (recentGoals.length * 4)) * 100);
            const insights = {
                period: `${days} days`,
                totalXP,
                averageWaterIntake: Math.round(averageWaterIntake * 10) / 10,
                averageSleepHours: Math.round(averageSleepHours * 10) / 10,
                averageCalories: Math.round(averageCalories),
                totalCompletedTasks,
                consistencyScore,
                recommendations: this.generateRecommendations(averageWaterIntake, averageSleepHours, consistencyScore, userProfile),
                trends: this.analyzeTrends(recentGoals)
            };
            logger_1.logger.info(`Wellness insights generated for user: ${email}`);
            res.json({
                success: true,
                message: 'Wellness insights generated successfully',
                data: insights
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAIServiceStatus(req, res, next) {
        try {
            const isAvailable = await aiService_1.aiService.isAvailable();
            res.json({
                success: true,
                message: 'AI service status retrieved successfully',
                data: {
                    available: isAvailable,
                    timestamp: new Date().toISOString()
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    static generateRecommendations(avgWater, avgSleep, consistency, userProfile) {
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
    static analyzeTrends(goals) {
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
exports.WellnessController = WellnessController;
//# sourceMappingURL=wellnessController.js.map