"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const templateController_1 = require("../controllers/templateController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validation_2 = require("../utils/validation");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', templateController_1.templateController.getTemplates);
router.post('/', (0, validation_1.validate)(validation_2.templateValidation.create), templateController_1.templateController.createTemplate);
router.get('/search', templateController_1.templateController.searchTemplates);
router.get('/:id', templateController_1.templateController.getTemplateById);
router.put('/:id', (0, validation_1.validate)(validation_2.templateValidation.update), templateController_1.templateController.updateTemplate);
router.delete('/:id', templateController_1.templateController.deleteTemplate);
exports.default = router;
//# sourceMappingURL=templateRoutes.js.map