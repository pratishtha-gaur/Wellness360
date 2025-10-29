"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.post('/', validation_1.validateUserProfile, validation_1.handleValidationErrors, userController_1.UserController.createUserProfile);
router.get('/:email', userController_1.UserController.getUserProfile);
router.put('/:email', validation_1.validateUpdateUserProfile, validation_1.handleValidationErrors, userController_1.UserController.updateUserProfile);
router.delete('/:email', userController_1.UserController.deleteUserProfile);
router.get('/', userController_1.UserController.getAllUserProfiles);
router.get('/:email/stats', userController_1.UserController.getUserStats);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map