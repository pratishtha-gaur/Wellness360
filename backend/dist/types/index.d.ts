export interface IUserProfile {
    name: string;
    email: string;
    age: number;
    gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    weight: number;
    height: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IDailyGoals {
    userEmail: string;
    waterIntake: number;
    sleepHours: number;
    dietType: 'vegetarian' | 'vegan' | 'omnivore' | 'keto' | 'paleo' | 'mediterranean' | 'other';
    dailyCalorieTarget: number;
    xp: number;
    level: number;
    date: Date;
    completedTasks: string[];
    createdAt?: Date;
    updatedAt?: Date;
}
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
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
export interface IXPCalculation {
    currentLevel: number;
    currentXP: number;
    xpToNextLevel: number;
    totalXPForCurrentLevel: number;
    progressPercentage: number;
}
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
    completedTasks?: string[];
}
export interface ApiError {
    message: string;
    statusCode: number;
    field?: string;
}
//# sourceMappingURL=index.d.ts.map