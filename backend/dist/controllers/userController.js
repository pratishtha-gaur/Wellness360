"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const models_1 = require("../models");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
class UserController {
    static async createUserProfile(req, res, next) {
        try {
            const { name, email, age, gender, weight, height } = req.body;
            const existingUser = await models_1.UserProfile.findByEmail(email);
            if (existingUser) {
                throw new errorHandler_1.AppError('User profile already exists with this email', 409);
            }
            const userProfile = new models_1.UserProfile({
                name,
                email,
                age,
                gender,
                weight,
                height
            });
            await userProfile.save();
            logger_1.logger.info(`New user profile created: ${email}`);
            res.status(201).json({
                success: true,
                message: 'User profile created successfully',
                data: userProfile
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getUserProfile(req, res, next) {
        try {
            const { email } = req.params;
            const userProfile = await models_1.UserProfile.findByEmail(email);
            if (!userProfile) {
                throw new errorHandler_1.AppError('User profile not found', 404);
            }
            res.json({
                success: true,
                message: 'User profile retrieved successfully',
                data: userProfile
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateUserProfile(req, res, next) {
        try {
            const { email } = req.params;
            const updateData = req.body;
            const userProfile = await models_1.UserProfile.findByEmail(email);
            if (!userProfile) {
                throw new errorHandler_1.AppError('User profile not found', 404);
            }
            const updatedProfile = await userProfile.updateProfile(updateData);
            logger_1.logger.info(`User profile updated: ${email}`);
            res.json({
                success: true,
                message: 'User profile updated successfully',
                data: updatedProfile
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteUserProfile(req, res, next) {
        try {
            const { email } = req.params;
            const userProfile = await models_1.UserProfile.findByEmail(email);
            if (!userProfile) {
                throw new errorHandler_1.AppError('User profile not found', 404);
            }
            await models_1.UserProfile.findByIdAndDelete(userProfile._id);
            logger_1.logger.info(`User profile deleted: ${email}`);
            res.json({
                success: true,
                message: 'User profile deleted successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAllUserProfiles(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const userProfiles = await models_1.UserProfile.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            const total = await models_1.UserProfile.countDocuments();
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
        }
        catch (error) {
            next(error);
        }
    }
    static async getUserStats(req, res, next) {
        try {
            const { email } = req.params;
            const userProfile = await models_1.UserProfile.findByEmail(email);
            if (!userProfile) {
                throw new errorHandler_1.AppError('User profile not found', 404);
            }
            const heightInMeters = userProfile.height / 100;
            const bmi = Math.round((userProfile.weight / (heightInMeters * heightInMeters)) * 100) / 100;
            let bmiCategory = '';
            if (bmi < 18.5)
                bmiCategory = 'Underweight';
            else if (bmi < 25)
                bmiCategory = 'Normal weight';
            else if (bmi < 30)
                bmiCategory = 'Overweight';
            else
                bmiCategory = 'Obese';
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
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=userController.js.map