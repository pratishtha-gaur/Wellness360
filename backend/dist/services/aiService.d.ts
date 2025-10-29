import { IUserProfile, IDailyGoals, IWellnessPlan } from '../types';
export declare class AIService {
    private model;
    private wellnessPrompt;
    private wellnessChain;
    private initialized;
    constructor();
    generateWellnessPlan(userProfile: IUserProfile, dailyGoals: IDailyGoals): Promise<IWellnessPlan>;
    generateQuickTips(userProfile: IUserProfile, dailyGoals: IDailyGoals, category: 'diet' | 'exercise' | 'sleep' | 'hydration' | 'general'): Promise<string[]>;
    isAvailable(): Promise<boolean>;
}
export declare const aiService: AIService;
//# sourceMappingURL=aiService.d.ts.map