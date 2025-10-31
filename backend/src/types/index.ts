// User Profile Types
export interface IUserProfile {
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  weight: number; // in kg
  height: number; // in cm
  createdAt?: Date;
  updatedAt?: Date;
}

// Daily Goals Types
export interface IDailyGoals {
  userEmail: string;
  waterIntake: number; // in liters
  sleepHours: number;
  dietType: 'vegetarian' | 'vegan' | 'omnivore' | 'keto' | 'paleo' | 'mediterranean' | 'other';
  dailyCalorieTarget: number;
  xp: number;
  level: number;
  date: Date;
  plannedTasks: string[];
  completedTasks: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Wellness Plan Types
export interface IWellnessPlan {
  userProfile: IUserProfile;
  dailyGoals: IDailyGoals;
  personalizedRecommendations: {
    diet: string[];
    exercise: string[];
    sleep: string[];
    hydration: string[];
    general: string[];
  };
  aiInsights: string;
  generatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// XP/Level System Types
export interface IXPCalculation {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXPForCurrentLevel: number;
  progressPercentage: number;
}

// Request Types
export interface CreateUserProfileRequest {
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  weight: number;
  height: number;
}

export interface UpdateUserProfileRequest {
  name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  weight?: number;
  height?: number;
}

export interface CreateDailyGoalsRequest {
  userEmail: string;
  waterIntake: number;
  sleepHours: number;
  dietType: 'vegetarian' | 'vegan' | 'omnivore' | 'keto' | 'paleo' | 'mediterranean' | 'other';
  dailyCalorieTarget: number;
}

export interface UpdateDailyGoalsRequest {
  waterIntake?: number;
  sleepHours?: number;
  dietType?: 'vegetarian' | 'vegan' | 'omnivore' | 'keto' | 'paleo' | 'mediterranean' | 'other';
  dailyCalorieTarget?: number;
  plannedTasks?: string[];
  completedTasks?: string[];
}

// Error Types
export interface ApiError {
  message: string;
  statusCode: number;
  field?: string;
}
