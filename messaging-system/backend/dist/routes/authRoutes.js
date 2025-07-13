"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validation_2 = require("../utils/validation");
const router = (0, express_1.Router)();
router.post('/register', (0, validation_1.validate)(validation_2.authValidation.register), authController_1.authController.register);
router.post('/login', (0, validation_1.validate)(validation_2.authValidation.login), authController_1.authController.login);
router.get('/verify-email', authController_1.authController.verifyEmail);
router.post('/resend-verification', (0, validation_1.validate)(validation_2.authValidation.forgotPassword), authController_1.authController.resendVerification);
router.post('/forgot-password', (0, validation_1.validate)(validation_2.authValidation.forgotPassword), authController_1.authController.forgotPassword);
router.post('/reset-password', (0, validation_1.validate)(validation_2.authValidation.resetPassword), authController_1.authController.resetPassword);
router.post('/logout', auth_1.authenticate, authController_1.authController.logout);
router.get('/profile', auth_1.authenticate, authController_1.authController.getProfile);
router.put('/profile', auth_1.authenticate, (0, validation_1.validate)(validation_2.authValidation.updateProfile), authController_1.authController.updateProfile);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map