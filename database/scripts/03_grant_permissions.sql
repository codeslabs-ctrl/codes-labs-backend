-- Script para otorgar permisos adicionales si es necesario
-- Ejecutar conectado a la base de datos codeslabs_db como superusuario o codeslabs_user

-- Asegurar que el usuario tiene todos los permisos necesarios
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO codeslabs_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO codeslabs_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO codeslabs_user;

-- Configurar privilegios por defecto
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO codeslabs_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO codeslabs_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO codeslabs_user;

