import { Request, Response } from 'express';
import { ProjectModel } from '../models/project.model';

export class ProjectController {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const projects = await ProjectModel.getAll();
      res.status(200).json({
        success: true,
        data: projects
      });
    } catch (error) {
      console.error('Error en ProjectController.getAll:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los proyectos'
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await ProjectModel.getById(id);

      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Proyecto no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: project
      });
    } catch (error) {
      console.error('Error en ProjectController.getById:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el proyecto'
      });
    }
  }
}

