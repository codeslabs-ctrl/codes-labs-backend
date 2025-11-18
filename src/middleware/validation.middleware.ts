import { body } from 'express-validator';

export const contactValidation = [
  body('nombreContacto')
    .trim()
    .notEmpty()
    .withMessage('El nombre de contacto es requerido')
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede exceder 100 caracteres'),

  body('nombreEmpresa')
    .trim()
    .notEmpty()
    .withMessage('El nombre de la empresa es requerido')
    .isLength({ min: 2 })
    .withMessage('El nombre de la empresa debe tener al menos 2 caracteres')
    .isLength({ max: 100 })
    .withMessage('El nombre de la empresa no puede exceder 100 caracteres'),

  body('emailContacto')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Por favor ingresa un email válido')
    .normalizeEmail(),

  body('telefonoContacto')
    .trim()
    .notEmpty()
    .withMessage('El teléfono es requerido')
    .matches(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
    .withMessage('Por favor ingresa un teléfono válido'),

  body('comentarios')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Los comentarios no pueden exceder 5000 caracteres')
];

