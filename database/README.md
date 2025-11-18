# Scripts de Base de Datos

## Instrucciones para crear la base de datos

### Paso 1: Crear base de datos y usuario

Conectarse a PostgreSQL como superusuario:
```bash
psql -U postgres -h 69.164.244.24
```

Ejecutar el script:
```sql
\i database/scripts/01_create_database.sql
```

O ejecutar manualmente:
```sql
CREATE USER codeslabs_user WITH PASSWORD 'C0d3sL@bs_2024_S3cur3_P@ssw0rd!';
CREATE DATABASE codeslabs_db OWNER codeslabs_user;
GRANT ALL PRIVILEGES ON DATABASE codeslabs_db TO codeslabs_user;
```

### Paso 2: Crear tablas

Conectarse a la nueva base de datos:
```bash
psql -U codeslabs_user -h 69.164.244.24 -d codeslabs_db
```

Ejecutar el script:
```sql
\i database/scripts/02_create_tables.sql
```

Este script creará:
- Tabla `projects` con datos iniciales
- Tabla `project_stats` con estadísticas
- Tabla `project_technologies` con tecnologías
- Tabla `company_values` con Misión, Visión y Valores
- Tabla `contacts` para formularios de contacto
- Índices para optimización
- Triggers para actualización automática de timestamps

### Paso 3: Verificar permisos (opcional)

Si necesitas verificar o ajustar permisos:
```sql
\i database/scripts/03_grant_permissions.sql
```

## Credenciales

- **Usuario**: codeslabs_user
- **Contraseña**: C0d3sL@bs_2024_S3cur3_P@ssw0rd!
- **Base de datos**: codeslabs_db
- **Host**: 69.164.244.24
- **Puerto**: 5432

## Notas de Seguridad

⚠️ **IMPORTANTE**: Cambia la contraseña en producción después de crear el usuario.

Para cambiar la contraseña:
```sql
ALTER USER codeslabs_user WITH PASSWORD 'tu_nueva_contraseña_segura';
```

No olvides actualizar el archivo `.env` con la nueva contraseña.

