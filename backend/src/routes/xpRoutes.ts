import express from 'express';
import { XPController } from '@/controllers/xpController';

const router = express.Router();

// Get user's XP and level information
router.get('/:email/info', XPController.getUserXPInfo);

// Get user's progress summary
router.get('/:email/progress', XPController.getUserProgressSummary);

// Get available achievements
router.get('/achievements', XPController.getAvailableAchievements);

// Check and unlock achievements for a user
router.get('/:email/achievements', XPController.checkAchievements);

// Get level rewards for a specific level
router.get('/rewards/:level', XPController.getLevelRewards);

// Get leaderboard
router.get('/leaderboard', XPController.getLeaderboard);

// Get user's XP history
router.get('/:email/history', XPController.getXPHistory);

// Add bonus XP to user (admin function)
router.post('/:email/bonus', XPController.addBonusXP);

export default router;
