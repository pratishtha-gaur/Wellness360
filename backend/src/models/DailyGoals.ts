import mongoose, { Document, Model, Schema } from 'mongoose';
import { IDailyGoals } from '@/types';

// DailyGoals Document interface extending Mongoose Document
export interface IDailyGoalsDocument extends Document, IDailyGoals {
  addCompletedTask(taskName: string): Promise<IDailyGoalsDocument>;
  removeCompletedTask(taskName: string): Promise<IDailyGoalsDocument>;
  resetDailyGoals(): Promise<IDailyGoalsDocument>;
}

// Model statics interface
interface IDailyGoalsModel extends Model<IDailyGoalsDocument> {
  findByUserAndDate(userEmail: string, date: Date): Promise<IDailyGoalsDocument | null>;
  getUserStats(userEmail: string): Promise<IDailyGoalsDocument | null>;
}

// DailyGoals Schema
const dailyGoalsSchema = new Schema<IDailyGoalsDocument>({
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
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'dailygoals'
});

// Compound index for efficient queries
dailyGoalsSchema.index({ userEmail: 1, date: -1 });
dailyGoalsSchema.index({ userEmail: 1, level: -1 });
dailyGoalsSchema.index({ date: -1 });

// Virtual for daily progress percentage
dailyGoalsSchema.virtual('dailyProgress').get(function() {
  const totalTasks = 4; // water, sleep, diet, calories
  const completedCount = this.completedTasks.length;
  return Math.round((completedCount / totalTasks) * 100);
});

// Virtual for XP needed to next level
dailyGoalsSchema.virtual('xpToNextLevel').get(function() {
  const xpForNextLevel = this.level * 100; // 100 XP per level
  return Math.max(0, xpForNextLevel - this.xp);
});

// Virtual for level progress percentage
dailyGoalsSchema.virtual('levelProgress').get(function() {
  const xpForCurrentLevel = (this.level - 1) * 100;
  const xpForNextLevel = this.level * 100;
  const currentLevelXP = this.xp - xpForCurrentLevel;
  const totalLevelXP = xpForNextLevel - xpForCurrentLevel;
  return Math.round((currentLevelXP / totalLevelXP) * 100);
});

// Ensure virtual fields are serialized
dailyGoalsSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  }
});

// Pre-save middleware for XP and level calculation
dailyGoalsSchema.pre('save', function(next) {
  // Calculate XP based on completed tasks
  const baseXP = 10; // Base XP per task
  const bonusXP = this.completedTasks.length > 2 ? 5 : 0; // Bonus for completing multiple tasks
  this.xp = (this.completedTasks.length * baseXP) + bonusXP;
  
  // Calculate level based on XP
  this.level = Math.floor(this.xp / 100) + 1;
  
  next();
});

// Static method to find goals by user email and date
dailyGoalsSchema.statics.findByUserAndDate = function(userEmail: string, date: Date) {
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

// Static method to get user's current level and XP
dailyGoalsSchema.statics.getUserStats = function(userEmail: string) {
  return this.findOne({ userEmail: userEmail.toLowerCase() })
    .sort({ date: -1 })
    .select('xp level completedTasks');
};

// Instance method to add completed task
dailyGoalsSchema.methods.addCompletedTask = function(taskName: string) {
  if (!this.completedTasks.includes(taskName)) {
    this.completedTasks.push(taskName);
  }
  return this.save();
};

// Instance method to remove completed task
dailyGoalsSchema.methods.removeCompletedTask = function(taskName: string) {
  this.completedTasks = this.completedTasks.filter((task: string) => task !== taskName);
  return this.save();
};

// Instance method to reset daily goals
dailyGoalsSchema.methods.resetDailyGoals = function() {
  this.completedTasks = [];
  this.xp = 0;
  this.level = 1;
  return this.save();
};

// Create and export the model
const DailyGoals = mongoose.model<IDailyGoalsDocument, IDailyGoalsModel>('DailyGoals', dailyGoalsSchema);

export default DailyGoals;
