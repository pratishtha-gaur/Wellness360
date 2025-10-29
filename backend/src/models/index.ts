// Export all models from a central location
export { default as UserProfile, IUserProfileDocument } from './UserProfile';
export { default as DailyGoals, IDailyGoalsDocument } from './DailyGoals';

// Re-export types for convenience
export type { IUserProfile, IDailyGoals } from '@/types';
