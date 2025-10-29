"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const dailyGoalsSchema = new mongoose_1.Schema({
    userEmail: {
        type: String,
        required: [true, 'User email is required'],
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'Please provide a valid email address'
        ]
    },
    waterIntake: {
        type: Number,
        required: [true, 'Water intake is required'],
        min: [0, 'Water intake cannot be negative'],
        max: [10, 'Water intake cannot exceed 10 liters per day'],
        default: 0
    },
    sleepHours: {
        type: Number,
        required: [true, 'Sleep hours is required'],
        min: [0, 'Sleep hours cannot be negative'],
        max: [24, 'Sleep hours cannot exceed 24 hours'],
        default: 0
    },
    dietType: {
        type: String,
        required: [true, 'Diet type is required'],
        enum: {
            values: ['vegetarian', 'vegan', 'omnivore', 'keto', 'paleo', 'mediterranean', 'other'],
            message: 'Diet type must be one of: vegetarian, vegan, omnivore, keto, paleo, mediterranean, other'
        },
        default: 'omnivore'
    },
    dailyCalorieTarget: {
        type: Number,
        required: [true, 'Daily calorie target is required'],
        min: [800, 'Daily calorie target must be at least 800 calories'],
        max: [5000, 'Daily calorie target cannot exceed 5000 calories'],
        default: 2000
    },
    xp: {
        type: Number,
        default: 0,
        min: [0, 'XP cannot be negative']
    },
    level: {
        type: Number,
        default: 1,
        min: [1, 'Level must be at least 1'],
        max: [100, 'Level cannot exceed 100']
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now
    },
    completedTasks: [{
            type: String,
            trim: true
        }]
}, {
    timestamps: true,
    collection: 'dailygoals'
});
dailyGoalsSchema.index({ userEmail: 1, date: -1 });
dailyGoalsSchema.index({ userEmail: 1, level: -1 });
dailyGoalsSchema.index({ date: -1 });
dailyGoalsSchema.virtual('dailyProgress').get(function () {
    const totalTasks = 4;
    const completedCount = this.completedTasks.length;
    return Math.round((completedCount / totalTasks) * 100);
});
dailyGoalsSchema.virtual('xpToNextLevel').get(function () {
    const xpForNextLevel = this.level * 100;
    return Math.max(0, xpForNextLevel - this.xp);
});
dailyGoalsSchema.virtual('levelProgress').get(function () {
    const xpForCurrentLevel = (this.level - 1) * 100;
    const xpForNextLevel = this.level * 100;
    const currentLevelXP = this.xp - xpForCurrentLevel;
    const totalLevelXP = xpForNextLevel - xpForCurrentLevel;
    return Math.round((currentLevelXP / totalLevelXP) * 100);
});
dailyGoalsSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});
dailyGoalsSchema.pre('save', function (next) {
    const baseXP = 10;
    const bonusXP = this.completedTasks.length > 2 ? 5 : 0;
    this.xp = (this.completedTasks.length * baseXP) + bonusXP;
    this.level = Math.floor(this.xp / 100) + 1;
    next();
});
dailyGoalsSchema.statics.findByUserAndDate = function (userEmail, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return this.findOne({
        userEmail: userEmail.toLowerCase(),
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });
};
dailyGoalsSchema.statics.getUserStats = function (userEmail) {
    return this.findOne({ userEmail: userEmail.toLowerCase() })
        .sort({ date: -1 })
        .select('xp level completedTasks');
};
dailyGoalsSchema.methods.addCompletedTask = function (taskName) {
    if (!this.completedTasks.includes(taskName)) {
        this.completedTasks.push(taskName);
    }
    return this.save();
};
dailyGoalsSchema.methods.removeCompletedTask = function (taskName) {
    this.completedTasks = this.completedTasks.filter((task) => task !== taskName);
    return this.save();
};
dailyGoalsSchema.methods.resetDailyGoals = function () {
    this.completedTasks = [];
    this.xp = 0;
    this.level = 1;
    return this.save();
};
const DailyGoals = mongoose_1.default.model('DailyGoals', dailyGoalsSchema);
exports.default = DailyGoals;
//# sourceMappingURL=DailyGoals.js.map