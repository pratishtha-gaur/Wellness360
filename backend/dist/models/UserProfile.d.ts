import { Document, Model } from 'mongoose';
import { IUserProfile } from '../types';
export interface IUserProfileDocument extends Document, IUserProfile {
    updateProfile(updateData: Partial<IUserProfile>): Promise<IUserProfileDocument>;
}
interface IUserProfileModel extends Model<IUserProfileDocument> {
    findByEmail(email: string): Promise<IUserProfileDocument | null>;
}
declare const UserProfile: IUserProfileModel;
export default UserProfile;
//# sourceMappingURL=UserProfile.d.ts.map