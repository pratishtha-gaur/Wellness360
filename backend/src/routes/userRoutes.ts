import express from 'express';
import { UserController } from '@/controllers/userController';
import { 
  validateUserProfile, 
  validateUpdateUserProfile, 
  handleValidationErrors 
} from '@/middleware/validation';

const router = express.Router();

// Create user profile
router.post(
  '/',
  validateUserProfile,
  handleValidationErrors,
  UserController.createUserProfile
);

// Get user profile by email
router.get('/:email', UserController.getUserProfile);

// Update user profile
router.put(
  '/:email',
  validateUpdateUserProfile,
  handleValidationErrors,
  UserController.updateUserProfile
);

// Delete user profile
router.delete('/:email', UserController.deleteUserProfile);

// Get all user profiles (admin)
router.get('/', UserController.getAllUserProfiles);

// Get user statistics
router.get('/:email/stats', UserController.getUserStats);

export default router;
