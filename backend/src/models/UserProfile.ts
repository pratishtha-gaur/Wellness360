import mongoose, { Document, Model, Schema } from 'mongoose';
import { IUserProfile } from '@/types';

// UserProfile Document interface extending Mongoose Document
export interface IUserProfileDocument extends Document, IUserProfile {
  updateProfile(updateData: Partial<IUserProfile>): Promise<IUserProfileDocument>;
}

// Model statics interface
interface IUserProfileModel extends Model<IUserProfileDocument> {
  findByEmail(email: string): Promise<IUserProfileDocument | null>;
}

// UserProfile Schema
const userProfileSchema = new Schema<IUserProfileDocument>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [13, 'Age must be at least 13'],
    max: [120, 'Age cannot exceed 120']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['male', 'female', 'other', 'prefer-not-to-say'],
      message: 'Gender must be one of: male, female, other, prefer-not-to-say'
    }
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [20, 'Weight must be at least 20 kg'],
    max: [300, 'Weight cannot exceed 300 kg']
  },
  height: {
    type: Number,
    required: [true, 'Height is required'],
    min: [100, 'Height must be at least 100 cm'],
    max: [250, 'Height cannot exceed 250 cm']
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'userprofiles'
});

// Indexes for better query performance
userProfileSchema.index({ createdAt: -1 });

// Virtual for BMI calculation
userProfileSchema.virtual('bmi').get(function() {
  const heightInMeters = this.height / 100;
  return Math.round((this.weight / (heightInMeters * heightInMeters)) * 100) / 100;
});

// Ensure virtual fields are serialized
userProfileSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  }
});

// Pre-save middleware for data validation
userProfileSchema.pre('save', function(next) {
  // Additional validation logic can be added here
  next();
});

// Static method to find user by email
userProfileSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Instance method to update profile
userProfileSchema.methods.updateProfile = function(updateData: Partial<IUserProfile>) {
  Object.assign(this, updateData);
  return this.save();
};

// Create and export the model
const UserProfile = mongoose.model<IUserProfileDocument, IUserProfileModel>('UserProfile', userProfileSchema);

export default UserProfile;
