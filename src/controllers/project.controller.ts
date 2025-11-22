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

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, category, iconName, displayOrder, stats, technologies } = req.body;

      // Validaciones básicas
      if (!title || !description || !category || !iconName) {
        res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: title, description, category, iconName'
        });
        return;
      }

      const project = await ProjectModel.create({
        title,
        description,
        category,
        iconName,
        displayOrder,
        stats,
        technologies
      });

      res.status(201).json({
        success: true,
        data: project,
        message: 'Proyecto creado exitosamente'
      });
    } catch (error) {
      console.error('Error en ProjectController.create:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el proyecto'
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, category, iconName, displayOrder, isActive, stats, technologies } = req.body;

      // Verificar que el proyecto existe
      const existingProject = await ProjectModel.getById(id);
      if (!existingProject) {
        res.status(404).json({
          success: false,
          message: 'Proyecto no encontrado'
        });
        return;
      }

      // Actualizar proyecto
      const updatedProject = await ProjectModel.update(id, {
        title,
        description,
        category,
        iconName,
        displayOrder,
        isActive
      });

      // Actualizar estadísticas si se proporcionan
      if (stats !== undefined) {
        await ProjectModel.updateStats(id, stats);
      }

      // Actualizar tecnologías si se proporcionan
      if (technologies !== undefined) {
        await ProjectModel.updateTechnologies(id, technologies);
      }

      // Obtener el proyecto actualizado completo
      const fullProject = await ProjectModel.getById(id);

      res.status(200).json({
        success: true,
        data: fullProject,
        message: 'Proyecto actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en ProjectController.update:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el proyecto'
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Verificar que el proyecto existe
      const existingProject = await ProjectModel.getById(id);
      if (!existingProject) {
        res.status(404).json({
          success: false,
          message: 'Proyecto no encontrado'
        });
        return;
      }

      const deleted = await ProjectModel.delete(id);

      if (deleted) {
        res.status(200).json({
          success: true,
          message: 'Proyecto eliminado exitosamente'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al eliminar el proyecto'
        });
      }
    } catch (error) {
      console.error('Error en ProjectController.delete:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el proyecto'
      });
    }
  }

  // Métodos para gestionar detalles del proyecto
  async createDetail(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { projectDetail, displayOrder } = req.body;

      if (!projectDetail) {
        res.status(400).json({
          success: false,
          message: 'El campo projectDetail es requerido'
        });
        return;
      }

      // Verificar que el proyecto existe
      const project = await ProjectModel.getById(projectId);
      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Proyecto no encontrado'
        });
        return;
      }

      const detail = await ProjectModel.createDetail(projectId, {
        projectDetail,
        displayOrder
      });

      res.status(201).json({
        success: true,
        data: detail,
        message: 'Detalle creado exitosamente'
      });
    } catch (error) {
      console.error('Error en ProjectController.createDetail:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el detalle'
      });
    }
  }

  async updateDetail(req: Request, res: Response): Promise<void> {
    try {
      const { detailId } = req.params;
      const { projectDetail, displayOrder, isActive } = req.body;

      const detail = await ProjectModel.updateDetail(detailId, {
        projectDetail,
        displayOrder,
        isActive
      });

      if (!detail) {
        res.status(404).json({
          success: false,
          message: 'Detalle no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: detail,
        message: 'Detalle actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en ProjectController.updateDetail:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el detalle'
      });
    }
  }

  async deleteDetail(req: Request, res: Response): Promise<void> {
    try {
      const { detailId } = req.params;

      const deleted = await ProjectModel.deleteDetail(detailId);

      if (deleted) {
        res.status(200).json({
          success: true,
          message: 'Detalle eliminado exitosamente'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Detalle no encontrado'
        });
      }
    } catch (error) {
      console.error('Error en ProjectController.deleteDetail:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el detalle'
      });
    }
  }

  async updateAllDetails(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { details } = req.body;

      if (!Array.isArray(details)) {
        res.status(400).json({
          success: false,
          message: 'El campo details debe ser un array'
        });
        return;
      }

      // Verificar que el proyecto existe
      const project = await ProjectModel.getById(projectId);
      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Proyecto no encontrado'
        });
        return;
      }

      await ProjectModel.updateAllDetails(projectId, details);

      // Obtener los detalles actualizados
      const updatedDetails = await ProjectModel.getDetailsByProjectId(projectId);

      res.status(200).json({
        success: true,
        data: updatedDetails,
        message: 'Detalles actualizados exitosamente'
      });
    } catch (error) {
      console.error('Error en ProjectController.updateAllDetails:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar los detalles'
      });
    }
  }
}

