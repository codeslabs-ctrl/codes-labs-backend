import { Request, Response } from 'express';
import { CompanyValueModel } from '../models/company-value.model';

export class CompanyValueController {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const values = await CompanyValueModel.getAll();
      res.status(200).json({
        success: true,
        data: values
      });
    } catch (error) {
      console.error('Error en CompanyValueController.getAll:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los valores de la empresa'
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const value = await CompanyValueModel.getById(id);

      if (!value) {
        res.status(404).json({
          success: false,
          message: 'Valor no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: value
      });
    } catch (error) {
      console.error('Error en CompanyValueController.getById:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el valor'
      });
    }
  }
}

