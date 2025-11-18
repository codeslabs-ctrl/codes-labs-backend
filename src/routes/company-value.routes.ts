import { Router } from 'express';
import { CompanyValueController } from '../controllers/company-value.controller';

const router = Router();
const companyValueController = new CompanyValueController();

router.get('/', companyValueController.getAll.bind(companyValueController));
router.get('/:id', companyValueController.getById.bind(companyValueController));

export { router as companyValueRoutes };

