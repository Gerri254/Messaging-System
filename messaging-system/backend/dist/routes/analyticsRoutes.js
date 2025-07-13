"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/dashboard', analyticsController_1.analyticsController.getDashboardStats);
router.get('/reports', analyticsController_1.analyticsController.getMessageReports);
router.get('/usage', analyticsController_1.analyticsController.getUsageStats);
router.get('/export', analyticsController_1.analyticsController.exportData);
exports.default = router;
//# sourceMappingURL=analyticsRoutes.js.map