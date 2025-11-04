import express from 'express';
import { WellnessController } from '@/controllers/wellnessController';
import { validateWellnessPlanRequest, handleValidationErrors } from '@/middleware/validation';

const router = express.Router();

// Generate personalized wellness plan
router.get(
  '/:email/plan',
  validateWellnessPlanRequest,
  handleValidationErrors,
  WellnessController.generateWellnessPlan
);

// Get quick wellness tips for a specific category
router.get(
  '/:email/tips',
  WellnessController.getQuickTips
);

// Get wellness insights based on user's progress
router.get(
  '/:email/insights',
  WellnessController.getWellnessInsights
);

// Get personalized meal and workout plan
router.get(
  '/:email/meal-workout-plan',
  WellnessController.getMealWorkoutPlan
);

// Check AI service status
router.get(
  '/status',
  WellnessController.getAIServiceStatus
);

export default router;
