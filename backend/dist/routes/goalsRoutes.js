"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const goalsController_1 = require("../controllers/goalsController");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.post('/', validation_1.validateDailyGoals, validation_1.handleValidationErrors, goalsController_1.GoalsController.createDailyGoals);
router.get('/:email', goalsController_1.GoalsController.getDailyGoals);
router.put('/:email', validation_1.validateUpdateDailyGoals, validation_1.handleValidationErrors, goalsController_1.GoalsController.updateDailyGoals);
router.post('/:email/tasks', goalsController_1.GoalsController.addCompletedTask);
router.delete('/:email/tasks', goalsController_1.GoalsController.removeCompletedTask);
router.get('/:email/xp-stats', goalsController_1.GoalsController.getUserXPStats);
router.get('/:email/history', goalsController_1.GoalsController.getGoalHistory);
router.post('/:email/reset', goalsController_1.GoalsController.resetDailyGoals);
exports.default = router;
//# sourceMappingURL=goalsRoutes.js.map