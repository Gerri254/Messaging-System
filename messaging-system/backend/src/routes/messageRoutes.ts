import { Router } from 'express';
import { messageController } from '../controllers/messageController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { messageValidation } from '../utils/validation';

const router = Router();

router.use(authenticate);

router.get('/', messageController.getMessages);
router.post('/send', validate(messageValidation.send), messageController.sendMessage);
router.post('/bulk-send', validate(messageValidation.bulkSend), messageController.bulkSendMessage);
router.get('/history', messageController.getMessageHistory);
router.post('/validate-phone', validate(messageValidation.validatePhone), messageController.validatePhoneNumber);
router.get('/sms/usage-stats', messageController.getSMSUsageStats);
router.get('/:id', messageController.getMessageById);
router.get('/:id/status', messageController.getMessageStatus);
router.delete('/:id', messageController.cancelMessage);

export default router;