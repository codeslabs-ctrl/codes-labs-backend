# Instrucciones de Configuración de Base de Datos

## Credenciales Generadas

- **Usuario**: `codeslabs_user`
- **Contraseña**: `C0d3sL@bs_2024_S3cur3_P@ssw0rd!`
- **Base de datos**: `codeslabs_db`
- **Host**: `69.164.244.24`
- **Puerto**: `5432`

## Pasos para Configurar la Base de Datos

### 1. Conectarse a PostgreSQL como superusuario

```bash
psql -U postgres -h 69.164.244.24
```

### 2. Ejecutar Script de Creación de Base de Datos

```sql
-- Crear usuario
CREATE USER codeslabs_user WITH PASSWORD 'C0d3sL@bs_2024_S3cur3_P@ssw0rd!';

-- Crear base de datos
CREATE DATABASE codeslabs_db OWNER codeslabs_user;

-- Conceder privilegios
GRANT ALL PRIVILEGES ON DATABASE codeslabs_db TO codeslabs_user;
```

O ejecutar el script completo:
```bash
psql -U postgres -h 69.164.244.24 -f database/scripts/01_create_database.sql
```

### 3. Conectarse a la Nueva Base de Datos

```bash
psql -U codeslabs_user -h 69.164.244.24 -d codeslabs_db
```

### 4. Crear las Tablas

```bash
psql -U codeslabs_user -h 69.164.244.24 -d codeslabs_db -f database/scripts/02_create_tables.sql
```

O ejecutar manualmente desde psql:
```sql
\i database/scripts/02_create_tables.sql
```

### 5. Verificar Permisos (Opcional)

```bash
psql -U codeslabs_user -h 69.164.244.24 -d codeslabs_db -f database/scripts/03_grant_permissions.sql
```

## Estructura de Tablas Creadas

1. **projects** - Proyectos desarrollados
2. **project_stats** - Estadísticas de proyectos
3. **project_technologies** - Tecnologías por proyecto
4. **company_values** - Misión, Visión y Valores
5. **contacts** - Contactos recibidos

## Configurar el Archivo .env

Copia `env.config.example` a `.env` y ajusta las credenciales si las cambiaste:

```bash
cp env.config.example .env
```

## Verificar Conexión

Una vez configurado, puedes verificar la conexión ejecutando:

```bash
npm run dev
```

Deberías ver:
```
✅ Conexión a PostgreSQL exitosa: [timestamp]
🚀 Server running on port 3001
```

## Notas de Seguridad

⚠️ **IMPORTANTE**: 
- La contraseña generada es segura pero considera cambiarla en producción
- No compartas el archivo `.env` en el repositorio
- Usa conexiones SSL en producción (`POSTGRES_SSL=true`)

## Cambiar Contraseña del Usuario

Si deseas cambiar la contraseña después de crear el usuario:

```sql
ALTER USER codeslabs_user WITH PASSWORD 'tu_nueva_contraseña_segura';
```

No olvides actualizar el archivo `.env` con la nueva contraseña.

