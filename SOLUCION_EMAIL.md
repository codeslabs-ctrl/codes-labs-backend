# Solución: Error de Credenciales de Email

## Problema

```
Error: Missing credentials for "PLAIN"
```

Este error indica que las credenciales de email (`EMAIL_USER` y `EMAIL_PASSWORD`) no están configuradas en las variables de entorno.

## Solución

### 1. Crear Archivo .env

He creado el archivo `.env` en la carpeta `back-end` con todas las variables necesarias, incluyendo:

```env
EMAIL_USER=codes.labs.rc@gmail.com
EMAIL_PASSWORD=erkt jazp avno zcui
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=Codes-Labs <codes.labs.rc@gmail.com>
EMAIL_TO=codes.labs.rc@gmail.com
```

### 2. Verificar que el Archivo .env Existe

```bash
# En la carpeta back-end
ls .env
# O en Windows
dir .env
```

### 3. Reiniciar el Servidor

Después de crear el archivo `.env`, reinicia el servidor:

```bash
# Detener el servidor (Ctrl+C)
# Luego iniciar nuevamente
npm run dev
```

### 4. Verificar que Carga las Variables

El servidor debería mostrar:
```
✅ Servidor de email listo para enviar mensajes
```

En lugar de:
```
❌ Error en configuración de email
```

## Nota sobre Gmail

Si usas Gmail, necesitas:

1. **Habilitar "Contraseñas de aplicaciones"** en tu cuenta de Google:
   - Ir a: https://myaccount.google.com/apppasswords
   - Generar una contraseña de aplicación
   - Usar esa contraseña en `EMAIL_PASSWORD` (no tu contraseña normal)

2. **O usar OAuth2** (más complejo pero más seguro)

## Verificación

```bash
# 1. Verificar que .env existe
cat .env | grep EMAIL

# 2. Iniciar servidor
npm run dev

# 3. Verificar logs
# Debe mostrar: ✅ Servidor de email listo para enviar mensajes
```

## Si el Problema Persiste

1. **Verificar que las variables están cargadas**:
   ```typescript
   // Agregar temporalmente en email.config.ts para debug
   console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Definido' : 'No definido');
   console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Definido' : 'No definido');
   ```

2. **Verificar que dotenv está cargando el archivo**:
   - Asegúrate de que `dotenv.config()` se ejecuta al inicio de `index.ts`
   - Ya está configurado ✅

3. **Verificar formato del archivo .env**:
   - No debe tener espacios alrededor del `=`
   - No debe tener comillas a menos que sea necesario
   - Cada variable en una línea separada

## Archivo .env Creado

He creado el archivo `.env` con todas las configuraciones necesarias. Solo necesitas:

1. **Verificar que el archivo existe** en `back-end/.env`
2. **Reiniciar el servidor**
3. **Verificar que no hay más errores**

