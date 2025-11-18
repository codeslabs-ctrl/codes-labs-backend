# Endpoints de la API - Codes-Labs Backend

## Base URL
- **Desarrollo**: `http://localhost:3001/api/v1`
- **Producción**: `https://api.codes-labs.com/api/v1` (configurar según tu dominio)

## Seguridad Implementada

✅ **Helmet**: Headers de seguridad HTTP
✅ **CORS**: Configurado para permitir solo el origen del frontend
✅ **Rate Limiting**: 100 requests por 15 minutos por IP
✅ **Validación**: Express-validator para validar datos de entrada
✅ **Manejo de Errores**: Centralizado y estructurado

---

## Endpoints Disponibles

### 1. Health Check
```
GET /health
```
Verifica que el servidor esté funcionando.

**Respuesta:**
```json
{
  "status": "OK",
  "message": "Codes-Labs API is running",
  "timestamp": "2024-11-16T..."
}
```

---

### 2. Proyectos

#### Obtener todos los proyectos
```
GET /api/v1/projects
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Sistema de Análisis Predictivo",
      "description": "...",
      "category": "Machine Learning",
      "iconName": "bar-chart-3",
      "stats": {
        "accuracy": "95%",
        "roi": "+340%"
      },
      "technologies": ["Python", "TensorFlow", "React", "AWS"],
      "createdAt": "2024-11-16T...",
      "updatedAt": "2024-11-16T...",
      "isActive": true,
      "displayOrder": 1
    }
  ]
}
```

#### Obtener proyecto por ID
```
GET /api/v1/projects/:id
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "...",
    ...
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Proyecto no encontrado"
}
```

---

### 3. Valores de la Empresa

#### Obtener todos los valores
```
GET /api/v1/company-values
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Misión",
      "description": "...",
      "iconName": "target",
      "displayOrder": 1,
      "isActive": true
    }
  ]
}
```

#### Obtener valor por ID
```
GET /api/v1/company-values/:id
```

---

### 4. Formulario de Contacto

#### Enviar formulario de contacto
```
POST /api/v1/contact/send
```

**Body (JSON):**
```json
{
  "nombreContacto": "Juan Pérez",
  "nombreEmpresa": "Mi Empresa S.A.",
  "emailContacto": "juan@empresa.com",
  "telefonoContacto": "+34 123 456 789",
  "comentarios": "Mensaje con texto enriquecido..."
}
```

**Validaciones:**
- `nombreContacto`: Requerido, mínimo 2 caracteres, máximo 100
- `nombreEmpresa`: Requerido, mínimo 2 caracteres, máximo 100
- `emailContacto`: Requerido, formato de email válido
- `telefonoContacto`: Requerido, formato de teléfono válido
- `comentarios`: Opcional, máximo 5000 caracteres

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Mensaje enviado exitosamente. Te contactaremos pronto."
}
```

**Error de validación (400):**
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "type": "field",
      "msg": "El email es requerido",
      "path": "emailContacto",
      "location": "body"
    }
  ]
}
```

**Error del servidor (500):**
```json
{
  "success": false,
  "message": "Error al enviar el mensaje. Por favor, intenta nuevamente más tarde."
}
```

---

## Códigos de Estado HTTP

- **200**: Solicitud exitosa
- **400**: Error de validación
- **404**: Recurso no encontrado
- **429**: Demasiadas solicitudes (Rate Limit)
- **500**: Error interno del servidor

---

## Notas Importantes

1. **Rate Limiting**: Máximo 100 requests por 15 minutos por IP
2. **CORS**: Solo permite solicitudes desde el origen configurado en `CORS_ORIGIN`
3. **Content-Type**: Todas las solicitudes POST deben usar `application/json`
4. **Email**: Los contactos se guardan en BD y se envían por email a `codes.labs.rc@gmail.com`

---

## Ejemplo de Uso desde Frontend

```typescript
// Obtener proyectos
this.apiService.getProjects().subscribe({
  next: (response) => {
    if (response.success) {
      this.projects = response.data;
    }
  },
  error: (error) => {
    console.error('Error:', error);
  }
});

// Enviar formulario
this.apiService.sendContact(formData).subscribe({
  next: (result) => {
    if (result.success) {
      // Mostrar mensaje de éxito
    }
  }
});
```

