-- Script para crear la base de datos y usuario
-- Ejecutar como superusuario (postgres)

-- Crear usuario si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'codeslabs_user') THEN
        CREATE USER codeslabs_user WITH PASSWORD 'C0d3sL@bs_2024_S3cur3_P@ssw0rd!';
    END IF;
END
$$;

-- Crear base de datos si no existe
SELECT 'CREATE DATABASE codeslabs_db OWNER codeslabs_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'codeslabs_db')\gexec

-- Conceder privilegios
GRANT ALL PRIVILEGES ON DATABASE codeslabs_db TO codeslabs_user;

-- Conectar a la nueva base de datos
\c codeslabs_db

-- Conceder privilegios en el esquema público
GRANT ALL ON SCHEMA public TO codeslabs_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO codeslabs_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO codeslabs_user;

-- Configurar privilegios por defecto para futuras tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO codeslabs_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO codeslabs_user;

