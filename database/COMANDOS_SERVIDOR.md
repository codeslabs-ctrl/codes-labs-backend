# Comandos para Configurar PostgreSQL desde el Servidor

## Si estás conectado como root en el servidor

### Opción 1: Cambiar al usuario postgres (Recomendado)

```bash
# Cambiar al usuario postgres
su - postgres

# Conectarse a PostgreSQL
psql

# O directamente
su - postgres -c "psql"
```

### Opción 2: Usar sudo (Más rápido)

```bash
# Conectarse directamente
sudo -u postgres psql
```

### Opción 3: Si PostgreSQL permite conexiones locales

```bash
# Conectarse directamente
psql -U postgres
```

---

## Comandos SQL para Ejecutar

Una vez conectado a PostgreSQL, ejecuta estos comandos:

### Paso 1: Crear Usuario y Base de Datos

```sql
-- Crear usuario
CREATE USER codeslabs_user WITH PASSWORD 'C0d3sL@bs_2024_S3cur3_P@ssw0rd!';

-- Crear base de datos
CREATE DATABASE codeslabs_db OWNER codeslabs_user;

-- Conceder privilegios
GRANT ALL PRIVILEGES ON DATABASE codeslabs_db TO codeslabs_user;

-- Salir de psql
\q
```

### Paso 2: Conectarse a la Nueva Base de Datos y Crear Tablas

```bash
# Desde el servidor (como root o postgres)
sudo -u postgres psql -d codeslabs_db
```

O si ya estás en psql:
```sql
\c codeslabs_db
```

Luego ejecuta el contenido del archivo `02_create_tables.sql` o usa el script completo:

```bash
# Desde el servidor, ejecutar el script completo
sudo -u postgres psql -d codeslabs_db -f /ruta/al/archivo/02_create_tables.sql
```

---

## Comandos Rápidos (Todo en Uno)

### Opción A: Ejecutar Script SQL Directamente

Si tienes los archivos SQL en el servidor:

```bash
# Crear usuario y BD
sudo -u postgres psql -f /ruta/01_create_database.sql

# Crear tablas
sudo -u postgres psql -d codeslabs_db -f /ruta/02_create_tables.sql
```

### Opción B: Ejecutar Comandos SQL Directamente desde Bash

```bash
# Crear usuario y base de datos
sudo -u postgres psql <<EOF
CREATE USER codeslabs_user WITH PASSWORD 'C0d3sL@bs_2024_S3cur3_P@ssw0rd!';
CREATE DATABASE codeslabs_db OWNER codeslabs_user;
GRANT ALL PRIVILEGES ON DATABASE codeslabs_db TO codeslabs_user;
EOF

# Crear tablas (copiar contenido de 02_create_tables.sql)
sudo -u postgres psql -d codeslabs_db <<EOF
-- Aquí pegar todo el contenido del archivo 02_create_tables.sql
EOF
```

---

## Verificar la Configuración

```bash
# Conectarse con el nuevo usuario
sudo -u postgres psql -d codeslabs_db -U codeslabs_user

# O desde fuera del servidor (si tienes acceso remoto)
psql -h 69.164.244.24 -U codeslabs_user -d codeslabs_db
```

### Verificar tablas creadas:

```sql
-- Listar todas las tablas
\dt

-- Ver estructura de una tabla
\d projects

-- Contar registros
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM company_values;
```

---

## Comandos Útiles de PostgreSQL

```sql
-- Listar bases de datos
\l

-- Listar usuarios
\du

-- Conectarse a otra base de datos
\c nombre_base_datos

-- Ver tablas
\dt

-- Ver estructura de tabla
\d nombre_tabla

-- Salir de psql
\q
```

---

## Resumen de Credenciales

- **Usuario PostgreSQL**: `codeslabs_user`
- **Contraseña**: `C0d3sL@bs_2024_S3cur3_P@ssw0rd!`
- **Base de datos**: `codeslabs_db`
- **Host**: `69.164.244.24`
- **Puerto**: `5432`

---

## Nota Importante

Si necesitas cambiar la contraseña después:

```sql
ALTER USER codeslabs_user WITH PASSWORD 'nueva_contraseña_segura';
```

No olvides actualizar el archivo `.env` del backend con la nueva contraseña.

