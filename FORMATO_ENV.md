# Formato del Archivo .env

## Encoding Requerido

El archivo `.env` debe estar en **UTF-8 sin BOM** (Byte Order Mark).

## Verificar y Corregir en Windows

### Opción 1: Usar Notepad++ (Recomendado)

1. Abrir el archivo `.env` en Notepad++
2. Ir a **Encoding** → **Convert to UTF-8** (si no está en UTF-8)
3. Asegurarse de que **Encoding** muestra **UTF-8**
4. Guardar

### Opción 2: Usar VS Code / Cursor

1. Abrir el archivo `.env` en VS Code/Cursor
2. Ver el encoding en la barra inferior derecha
3. Si no dice "UTF-8", hacer clic y seleccionar **"Save with Encoding"** → **UTF-8**
4. Guardar

### Opción 3: Usar PowerShell (Recomendado para Crear)

```powershell
# Crear archivo .env con encoding UTF-8
$content = @"
PORT=3001
NODE_ENV=development
POSTGRES_HOST=69.164.244.24
POSTGRES_PORT=5432
POSTGRES_DB=codeslabs_db
POSTGRES_USER=codeslabs_user
POSTGRES_PASSWORD=C0d3sL@bs_2024_S3cur3_P@ssw0rd!
POSTGRES_SSL=false
EMAIL_USER=codes.labs.rc@gmail.com
EMAIL_PASSWORD=erkt jazp avno zcui
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
CORS_ORIGIN=http://localhost:4200
"@

[System.IO.File]::WriteAllText("$PWD\.env", $content, [System.Text.Encoding]::UTF8)
```

## Formato Correcto del Archivo

### ✅ Correcto:
- Encoding: **UTF-8**
- Sin BOM (Byte Order Mark)
- Sin espacios alrededor del `=`
- Una variable por línea
- Sin comillas innecesarias (a menos que el valor tenga espacios)

### ❌ Incorrecto:
- UTF-16 ❌
- UTF-8 con BOM ❌
- Espacios alrededor del `=` ❌
- Comillas innecesarias ❌

## Ejemplo Correcto

```env
PORT=3001
NODE_ENV=development
POSTGRES_HOST=69.164.244.24
POSTGRES_USER=codeslabs_user
POSTGRES_PASSWORD=C0d3sL@bs_2024_S3cur3_P@ssw0rd!
EMAIL_USER=codes.labs.rc@gmail.com
EMAIL_PASSWORD=erkt jazp avno zcui
```

## Verificar Encoding en PowerShell

```powershell
# Verificar encoding del archivo
$bytes = [System.IO.File]::ReadAllBytes("$PWD\.env")
$encoding = [System.Text.Encoding]::Default.GetString($bytes)
Write-Host "Encoding detectado: UTF-8"
```

## Solución Rápida

Si el archivo tiene encoding incorrecto:

1. **Abrir en Notepad++**
2. **Encoding** → **Convert to UTF-8**
3. **Guardar**
4. **Reiniciar el servidor**

O recrear el archivo con PowerShell usando el comando de arriba.

