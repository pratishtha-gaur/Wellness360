import express from 'express';
import { GoalsController } from '@/controllers/goalsController';
import { 
  validateDailyGoals, 
  validateUpdateDailyGoals, 
  handleValidationErrors 
} from '@/middleware/validation';

const router = express.Router();

// Create daily goals
router.post(
  '/',
  validateDailyGoals,
  handleValidationErrors,
  GoalsController.createDailyGoals
);

// Get daily goals by user email and date
router.get('/:email', GoalsController.getDailyGoals);

// Update daily goals
router.put(
  '/:email',
  validateUpdateDailyGoals,
  handleValidationErrors,
  GoalsController.updateDailyGoals
);

// Add completed task
router.post(
  '/:email/tasks',
  GoalsController.addCompletedTask
);

// Remove completed task
router.delete(
  '/:email/tasks',
  GoalsController.removeCompletedTask
);

// Get user XP statistics
router.get('/:email/xp-stats', GoalsController.getUserXPStats);

// Get user goal history
router.get('/:email/history', GoalsController.getGoalHistory);

// Reset daily goals
router.post('/:email/reset', GoalsController.resetDailyGoals);

export default router;
