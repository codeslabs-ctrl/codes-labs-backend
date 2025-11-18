# Solución: Errores TypeScript "Cannot find module"

## Problema

TypeScript no encuentra los módulos aunque `node_modules` existe. Esto es común y tiene varias soluciones.

## Soluciones (Probar en Orden)

### Solución 1: Reinstalar Dependencias (Más Común)

```bash
cd back-end

# Eliminar node_modules y package-lock.json
rm -rf node_modules package-lock.json

# Reinstalar todo
npm install

# Verificar que se instalaron
ls node_modules/express
ls node_modules/@types/express
```

### Solución 2: Reiniciar Servidor TypeScript en el IDE

**VS Code / Cursor:**
1. Presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
2. Escribe: `TypeScript: Restart TS Server`
3. Presiona Enter

**O cierra y vuelve a abrir el IDE**

### Solución 3: Verificar que las Dependencias Están en package.json

Asegúrate de que `package.json` tiene todas estas dependencias:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "nodemailer": "^6.9.7",
    "express-validator": "^7.0.1",
    "pg": "^8.16.3",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/nodemailer": "^6.4.14",
    "@types/node": "^20.10.6",
    "@types/pg": "^8.15.6"
  }
}
```

### Solución 4: Limpiar Caché de npm

```bash
npm cache clean --force
npm install
```

### Solución 5: Verificar tsconfig.json

Asegúrate de que `tsconfig.json` tiene:

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

Ya está configurado correctamente ✅

### Solución 6: Instalar Dependencias Manualmente

Si nada funciona, instala cada una manualmente:

```bash
npm install express
npm install cors
npm install helmet
npm install express-rate-limit
npm install dotenv
npm install nodemailer
npm install express-validator
npm install pg

npm install --save-dev @types/express
npm install --save-dev @types/cors
npm install --save-dev @types/nodemailer
npm install --save-dev @types/node
npm install --save-dev @types/pg
```

## Verificación

Después de aplicar las soluciones:

```bash
# 1. Verificar que node_modules tiene las dependencias
ls node_modules/express
ls node_modules/@types/express

# 2. Compilar
npm run build

# 3. Si compila sin errores, está resuelto
```

## Si el Problema Persiste

1. **Cerrar completamente el IDE** y volver a abrirlo
2. **Verificar versión de Node.js**:
   ```bash
   node --version
   # Debe ser 18+ o 20+
   ```
3. **Verificar versión de npm**:
   ```bash
   npm --version
   ```

## Nota Importante

A veces el IDE muestra errores pero el código compila correctamente. Prueba:

```bash
npm run build
```

Si compila sin errores, el problema es solo del IDE, no del código.

