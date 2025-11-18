import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { contactValidation } from '../middleware/validation.middleware';

const router = Router();
const contactController = new ContactController();

router.post(
  '/send',
  contactValidation,
  contactController.sendContactEmail.bind(contactController)
);

export { router as contactRoutes };

