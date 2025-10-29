"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const xpController_1 = require("../controllers/xpController");
const router = express_1.default.Router();
router.get('/:email/info', xpController_1.XPController.getUserXPInfo);
router.get('/:email/progress', xpController_1.XPController.getUserProgressSummary);
router.get('/achievements', xpController_1.XPController.getAvailableAchievements);
router.get('/:email/achievements', xpController_1.XPController.checkAchievements);
router.get('/rewards/:level', xpController_1.XPController.getLevelRewards);
router.get('/leaderboard', xpController_1.XPController.getLeaderboard);
router.get('/:email/history', xpController_1.XPController.getXPHistory);
router.post('/:email/bonus', xpController_1.XPController.addBonusXP);
exports.default = router;
//# sourceMappingURL=xpRoutes.js.map