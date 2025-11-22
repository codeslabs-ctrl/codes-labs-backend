import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';

const router = Router();
const projectController = new ProjectController();

// Public routes
router.get('/', projectController.getAll.bind(projectController));
router.get('/:id', projectController.getById.bind(projectController));

// Admin routes (CRUD)
router.post('/', projectController.create.bind(projectController));
router.put('/:id', projectController.update.bind(projectController));
router.delete('/:id', projectController.delete.bind(projectController));

// Admin routes for project details
router.post('/:projectId/details', projectController.createDetail.bind(projectController));
router.put('/details/:detailId', projectController.updateDetail.bind(projectController));
router.delete('/details/:detailId', projectController.deleteDetail.bind(projectController));
router.put('/:projectId/details', projectController.updateAllDetails.bind(projectController));

export { router as projectRoutes };

