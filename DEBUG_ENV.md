# Debug: Verificar Carga de Variables de Entorno

## Problema

El archivo `.env` existe pero las variables no se están cargando correctamente.

## Solución Aplicada

He movido `dotenv.config()` al **inicio** de los archivos que usan `process.env`:
- `src/index.ts` - Ahora carga dotenv PRIMERO
- `src/config/database.config.ts` - Carga dotenv antes de usar process.env
- `src/config/email.config.ts` - Carga dotenv antes de usar process.env

## Verificación

### 1. Agregar Debug Temporal

Agrega estas líneas al inicio de `src/index.ts` (después de dotenv.config()):

```typescript
// Debug temporal
console.log('🔍 Variables de entorno cargadas:');
console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Definido' : 'No definido');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Definido' : 'No definido');
```

### 2. Verificar que el Archivo .env Está en la Ubicación Correcta

El archivo debe estar en:
```
D:\Users\Rgonzalez\Proyectos\Codes-Labs-Def\back-end\.env
```

**NO** en:
- `back-end/src/.env` ❌
- `back-end/dist/.env` ❌

### 3. Verificar Contenido del .env

Asegúrate de que el archivo `.env` tiene estas líneas exactas (sin espacios alrededor del `=`):

```env
POSTGRES_HOST=69.164.244.24
EMAIL_USER=codes.labs.rc@gmail.com
EMAIL_PASSWORD=erkt jazp avno zcui
```

**NO** debe tener:
```env
POSTGRES_HOST = 69.164.244.24  ❌ (espacios alrededor del =)
POSTGRES_HOST="69.164.244.24"  ❌ (comillas innecesarias)
```

### 4. Reiniciar el Servidor

Después de los cambios:

```bash
# Detener el servidor (Ctrl+C)
# Reiniciar
npm run dev
```

### 5. Verificar Salida

Deberías ver en la consola:
```
🔍 Variables de entorno cargadas:
POSTGRES_HOST: 69.164.244.24
EMAIL_USER: Definido
EMAIL_PASSWORD: Definido
✅ Conexión a PostgreSQL exitosa
✅ Servidor de email listo para enviar mensajes
```

## Si Aún No Funciona

### Opción 1: Especificar Ruta Explícita

En `src/index.ts`, cambiar:
```typescript
dotenv.config();
```

Por:
```typescript
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
```

### Opción 2: Verificar que el Archivo Se Está Leyendo

Agregar al inicio de `src/index.ts`:
```typescript
import fs from 'fs';
const envPath = path.resolve(__dirname, '../.env');
console.log('🔍 Buscando .env en:', envPath);
console.log('🔍 Archivo existe:', fs.existsSync(envPath));
if (fs.existsSync(envPath)) {
  console.log('🔍 Contenido (primeras líneas):');
  const content = fs.readFileSync(envPath, 'utf8');
  console.log(content.split('\n').slice(0, 5).join('\n'));
}
```

## Resumen de Cambios Aplicados

✅ `dotenv.config()` movido al inicio de `index.ts`  
✅ `dotenv.config()` agregado en `database.config.ts`  
✅ `dotenv.config()` agregado en `email.config.ts`  

Esto asegura que las variables se carguen antes de usarse.

