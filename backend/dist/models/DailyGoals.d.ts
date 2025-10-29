import { Document, Model } from 'mongoose';
import { IDailyGoals } from '../types';
export interface IDailyGoalsDocument extends Document, IDailyGoals {
    addCompletedTask(taskName: string): Promise<IDailyGoalsDocument>;
    removeCompletedTask(taskName: string): Promise<IDailyGoalsDocument>;
    resetDailyGoals(): Promise<IDailyGoalsDocument>;
}
interface IDailyGoalsModel extends Model<IDailyGoalsDocument> {
    findByUserAndDate(userEmail: string, date: Date): Promise<IDailyGoalsDocument | null>;
    getUserStats(userEmail: string): Promise<IDailyGoalsDocument | null>;
}
declare const DailyGoals: IDailyGoalsModel;
export default DailyGoals;
//# sourceMappingURL=DailyGoals.d.ts.map