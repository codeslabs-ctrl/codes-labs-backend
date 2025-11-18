# Codes-Labs Backend API

Backend API desarrollado con Node.js, Express y TypeScript para Codes-Labs.

## 🚀 Características

- **TypeScript**: Código type-safe
- **Express**: Framework web rápido y minimalista
- **PostgreSQL**: Base de datos relacional
- **Nodemailer**: Envío de emails profesionales
- **Arquitectura profesional**: Separación de capas (Controllers, Services, Models, Routes)

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL 16+
- npm o yarn

## 🛠️ Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. Crear la base de datos:
```bash
# Conectar a PostgreSQL como superusuario
psql -U postgres

# Ejecutar los scripts en orden:
\i database/scripts/01_create_database.sql
\c codeslabs_db
\i database/scripts/02_create_tables.sql
\i database/scripts/03_grant_permissions.sql
```

## 🗄️ Estructura de Base de Datos

### Tablas principales:

- **projects**: Proyectos desarrollados
- **project_stats**: Estadísticas de cada proyecto
- **project_technologies**: Tecnologías utilizadas en cada proyecto
- **company_values**: Misión, Visión y Valores de la empresa
- **contacts**: Contactos recibidos desde el formulario

## 🚀 Ejecución

### Desarrollo:
```bash
npm run dev
```

### Producción:
```bash
npm run build
npm start
```

## 📡 Endpoints

### Health Check
- `GET /health` - Verificar estado del servidor

### Contactos
- `POST /api/v1/contact/send` - Enviar formulario de contacto

### Proyectos
- `GET /api/v1/projects` - Obtener todos los proyectos
- `GET /api/v1/projects/:id` - Obtener proyecto por ID

### Valores de la Empresa
- `GET /api/v1/company-values` - Obtener todos los valores
- `GET /api/v1/company-values/:id` - Obtener valor por ID

## 🔐 Seguridad

- Validación de datos con express-validator
- Manejo de errores centralizado
- Variables de entorno para configuración sensible
- CORS configurado

## 📧 Configuración de Email

Para Gmail, necesitas crear una "Contraseña de aplicación":
1. Ir a tu cuenta de Google
2. Seguridad → Verificación en 2 pasos
3. Contraseñas de aplicaciones
4. Generar nueva contraseña para "Correo"
5. Usar esa contraseña en `EMAIL_PASSWORD`

## 📝 Scripts SQL

Los scripts están en `database/scripts/`:
1. `01_create_database.sql` - Crear BD y usuario
2. `02_create_tables.sql` - Crear tablas e insertar datos iniciales
3. `03_grant_permissions.sql` - Otorgar permisos

## 🏗️ Estructura del Proyecto

```
src/
├── config/          # Configuraciones (DB, Email)
├── controllers/     # Controladores de rutas
├── middleware/      # Middleware personalizado
├── models/          # Modelos de base de datos
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio
└── index.ts         # Punto de entrada
```

"# codes-labs-backend" 
