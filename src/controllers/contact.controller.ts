import { Request, Response } from 'express';
import { EmailService } from '../services/email.service';
import { ContactModel } from '../models/contact.model';
import { validationResult } from 'express-validator';

const emailService = new EmailService();

export class ContactController {
  async sendContactEmail(req: Request, res: Response): Promise<void> {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: errors.array()
        });
        return;
      }

      const formData = req.body;

      // Guardar contacto en la base de datos
      const contact = await ContactModel.create({
        nombreContacto: formData.nombreContacto,
        nombreEmpresa: formData.nombreEmpresa,
        emailContacto: formData.emailContacto,
        telefonoContacto: formData.telefonoContacto,
        comentarios: formData.comentarios
      });

      try {
        // Enviar email
        await emailService.sendContactEmail(formData);
        
        // Marcar email como enviado
        await ContactModel.markEmailAsSent(contact.id);
      } catch (emailError) {
        console.error('Error al enviar email, pero contacto guardado:', emailError);
        // El contacto ya está guardado, pero el email falló
        // Podríamos implementar un sistema de reintentos aquí
      }

      res.status(200).json({
        success: true,
        message: 'Mensaje enviado exitosamente. Te contactaremos pronto.'
      });
    } catch (error) {
      console.error('Error en ContactController:', error);
      res.status(500).json({
        success: false,
        message: 'Error al enviar el mensaje. Por favor, intenta nuevamente más tarde.'
      });
    }
  }
}

