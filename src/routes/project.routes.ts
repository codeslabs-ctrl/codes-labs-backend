import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';

const router = Router();
const projectController = new ProjectController();

router.get('/', projectController.getAll.bind(projectController));
router.get('/:id', projectController.getById.bind(projectController));

export { router as projectRoutes };

