"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const wellnessController_1 = require("../controllers/wellnessController");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.get('/:email/plan', validation_1.validateWellnessPlanRequest, validation_1.handleValidationErrors, wellnessController_1.WellnessController.generateWellnessPlan);
router.get('/:email/tips', wellnessController_1.WellnessController.getQuickTips);
router.get('/:email/insights', wellnessController_1.WellnessController.getWellnessInsights);
router.get('/status', wellnessController_1.WellnessController.getAIServiceStatus);
exports.default = router;
//# sourceMappingURL=wellnessRoutes.js.map