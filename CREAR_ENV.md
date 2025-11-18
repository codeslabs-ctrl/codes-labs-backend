# Crear Archivo .env - Instrucciones

## Problemas Detectados

1. **PostgreSQL**: Intenta conectar a `localhost` en lugar de `69.164.244.24`
2. **Email**: Las credenciales no se están cargando

## Solución: Crear Archivo .env

### Paso 1: Crear el Archivo

Crea un archivo llamado `.env` en la carpeta `back-end` con este contenido exacto:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# PostgreSQL Configuration (IMPORTANTE: usar la IP del servidor)
POSTGRES_HOST=69.164.244.24
POSTGRES_PORT=5432
POSTGRES_DB=codeslabs_db
POSTGRES_USER=codeslabs_user
POSTGRES_PASSWORD=C0d3sL@bs_2024_S3cur3_P@ssw0rd!
POSTGRES_SSL=false
POSTGRES_CONNECTION_TIMEOUT=30000
POSTGRES_QUERY_TIMEOUT=30000

# API Configuration
API_VERSION=v1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:4200
CORS_CREDENTIALS=true

# Security Configuration
ENCRYPTION_KEY=codeslabs-encryption-key-2024
API_KEY=codeslabs-api-key-2024
SALT_ROUNDS=12

# Rate Limiting Configuration
RATE_LIMIT_AUTH_MAX=100
RATE_LIMIT_AUTH_WINDOW=900000
RATE_LIMIT_INFORME_MAX=3
RATE_LIMIT_INFORME_WINDOW=60000
RATE_LIMIT_EMAIL_MAX=10
RATE_LIMIT_EMAIL_WINDOW=300000

# Email Configuration (CRÍTICO - Sin espacios alrededor del =)
EMAIL_USER=codes.labs.rc@gmail.com
EMAIL_PASSWORD=erkt jazp avno zcui
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=Codes-Labs <codes.labs.rc@gmail.com>
EMAIL_TO=codes.labs.rc@gmail.com

# Frontend Configuration
FRONTEND_URL=http://localhost:4200

# Logo Configuration
LOGO_PATH=./assets/logos/logo.webp
```

### Paso 2: Verificar que el Archivo se Creó

```bash
# En la carpeta back-end
ls .env
# O en Windows PowerShell
Test-Path .env
```

### Paso 3: Verificar que dotenv Carga el Archivo

El archivo `src/index.ts` ya tiene `dotenv.config()` al inicio, así que debería cargar automáticamente.

### Paso 4: Reiniciar el Servidor

```bash
# Detener el servidor (Ctrl+C)
# Luego reiniciar
npm run dev
```

## Verificación

Después de crear el `.env` y reiniciar, deberías ver:

```
✅ Conexión a PostgreSQL exitosa: [timestamp]
✅ Servidor de email listo para enviar mensajes
🚀 Server running on port 3001
```

## Si Aún Hay Problemas

### Problema 1: PostgreSQL aún intenta conectar a localhost

Verifica que el `.env` tiene:
```env
POSTGRES_HOST=69.164.244.24
```
**NO** `POSTGRES_HOST=localhost`

### Problema 2: Email aún da error

1. **Verificar que las variables están en el .env**:
   ```bash
   cat .env | grep EMAIL
   ```

2. **Verificar que no hay espacios**:
   ```env
   EMAIL_USER=codes.labs.rc@gmail.com  ✅ Correcto
   EMAIL_USER = codes.labs.rc@gmail.com  ❌ Incorrecto (tiene espacios)
   ```

3. **Agregar debug temporal** en `src/config/email.config.ts`:
   ```typescript
   console.log('EMAIL_USER:', process.env.EMAIL_USER);
   console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Definido' : 'No definido');
   ```

## Nota sobre Gmail

Si usas Gmail, la contraseña `erkt jazp avno zcui` parece ser una "Contraseña de aplicación" de Google, lo cual es correcto. Si no funciona:

1. Ir a: https://myaccount.google.com/apppasswords
2. Generar una nueva contraseña de aplicación
3. Actualizar `EMAIL_PASSWORD` en el `.env`

## Ubicación del Archivo

El archivo `.env` debe estar en:
```
D:\Users\Rgonzalez\Proyectos\Codes-Labs-Def\back-end\.env
```

**NO** en la carpeta `src` o en otra ubicación.

