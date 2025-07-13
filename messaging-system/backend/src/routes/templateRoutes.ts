import { Router } from 'express';
import { templateController } from '../controllers/templateController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { templateValidation } from '../utils/validation';

const router = Router();

router.use(authenticate);

router.get('/', templateController.getTemplates);
router.post('/', validate(templateValidation.create), templateController.createTemplate);
router.get('/search', templateController.searchTemplates);
router.get('/:id', templateController.getTemplateById);
router.put('/:id', validate(templateValidation.update), templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);

export default router;