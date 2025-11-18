#!/bin/bash
# Script rápido para configurar la base de datos desde el servidor
# Ejecutar como root o con sudo

echo "🔧 Configurando base de datos Codes-Labs..."

# Opción 1: Si estás como root, cambiar al usuario postgres
# su - postgres

# Opción 2: Usar sudo (recomendado)
# sudo -u postgres psql

# Opción 3: Si PostgreSQL permite conexiones locales sin autenticación
# psql -U postgres

# Comandos SQL para ejecutar directamente:

echo "📝 Ejecutando comandos SQL..."

# Conectarse y crear usuario y base de datos
sudo -u postgres psql <<EOF
-- Crear usuario si no existe
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'codeslabs_user') THEN
        CREATE USER codeslabs_user WITH PASSWORD 'C0d3sL@bs_2024_S3cur3_P@ssw0rd!';
    END IF;
END
\$\$;

-- Crear base de datos
SELECT 'CREATE DATABASE codeslabs_db OWNER codeslabs_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'codeslabs_db')\gexec

-- Conceder privilegios
GRANT ALL PRIVILEGES ON DATABASE codeslabs_db TO codeslabs_user;
EOF

echo "✅ Usuario y base de datos creados"

# Conectarse a la nueva base de datos y crear tablas
echo "📊 Creando tablas..."
sudo -u postgres psql -d codeslabs_db <<EOF
-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de proyectos
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0
);

-- Tabla de estadísticas de proyectos
CREATE TABLE IF NOT EXISTS project_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stat_key VARCHAR(100) NOT NULL,
    stat_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, stat_key)
);

-- Tabla de tecnologías de proyectos
CREATE TABLE IF NOT EXISTS project_technologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    technology VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, technology)
);

-- Tabla de valores de la empresa
CREATE TABLE IF NOT EXISTS company_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Tabla de contactos
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_contacto VARCHAR(255) NOT NULL,
    nombre_empresa VARCHAR(255) NOT NULL,
    email_contacto VARCHAR(255) NOT NULL,
    telefono_contacto VARCHAR(50) NOT NULL,
    comentarios TEXT,
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active);
CREATE INDEX IF NOT EXISTS idx_project_stats_project_id ON project_stats(project_id);
CREATE INDEX IF NOT EXISTS idx_project_technologies_project_id ON project_technologies(project_id);
CREATE INDEX IF NOT EXISTS idx_company_values_title ON company_values(title);
CREATE INDEX IF NOT EXISTS idx_company_values_is_active ON company_values(is_active);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email_contacto);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
\$\$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_values_updated_at BEFORE UPDATE ON company_values
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Conceder permisos
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO codeslabs_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO codeslabs_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO codeslabs_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO codeslabs_user;
EOF

echo "✅ Tablas creadas"

# Insertar datos iniciales
echo "📥 Insertando datos iniciales..."
sudo -u postgres psql -d codeslabs_db <<EOF
-- Proyectos
INSERT INTO projects (title, description, category, icon_name, display_order) VALUES
('Sistema de Análisis Predictivo', 'Plataforma de IA para predicción de demanda y optimización de inventario en tiempo real para cadena de retail.', 'Machine Learning', 'bar-chart-3', 1),
('Asistente Virtual Conversacional', 'Chatbot multilenguaje con procesamiento de lenguaje natural para atención al cliente 24/7.', 'NLP & IA', 'bot', 2),
('Plataforma de Automatización', 'Suite completa de automatización de procesos empresariales con integración multi-sistema.', 'Automatización', 'rocket', 3),
('Sistema de Visión por Computadora', 'Detección y clasificación automática de productos en líneas de producción industrial.', 'Computer Vision', 'activity', 4)
ON CONFLICT DO NOTHING;

-- Estadísticas
INSERT INTO project_stats (project_id, stat_key, stat_value)
SELECT p.id, 'accuracy', '95%' FROM projects p WHERE p.title = 'Sistema de Análisis Predictivo'
UNION ALL
SELECT p.id, 'roi', '+340%' FROM projects p WHERE p.title = 'Sistema de Análisis Predictivo'
UNION ALL
SELECT p.id, 'users', '50K+' FROM projects p WHERE p.title = 'Asistente Virtual Conversacional'
UNION ALL
SELECT p.id, 'satisfaction', '4.8/5' FROM projects p WHERE p.title = 'Asistente Virtual Conversacional'
UNION ALL
SELECT p.id, 'efficiency', '+85%' FROM projects p WHERE p.title = 'Plataforma de Automatización'
UNION ALL
SELECT p.id, 'time_saved', '2000h/mes' FROM projects p WHERE p.title = 'Plataforma de Automatización'
UNION ALL
SELECT p.id, 'accuracy', '98.5%' FROM projects p WHERE p.title = 'Sistema de Visión por Computadora'
UNION ALL
SELECT p.id, 'speed', '200 items/min' FROM projects p WHERE p.title = 'Sistema de Visión por Computadora'
ON CONFLICT DO NOTHING;

-- Tecnologías
INSERT INTO project_technologies (project_id, technology)
SELECT p.id, 'Python' FROM projects p WHERE p.title = 'Sistema de Análisis Predictivo'
UNION ALL
SELECT p.id, 'TensorFlow' FROM projects p WHERE p.title = 'Sistema de Análisis Predictivo'
UNION ALL
SELECT p.id, 'React' FROM projects p WHERE p.title = 'Sistema de Análisis Predictivo'
UNION ALL
SELECT p.id, 'AWS' FROM projects p WHERE p.title = 'Sistema de Análisis Predictivo'
UNION ALL
SELECT p.id, 'GPT-4' FROM projects p WHERE p.title = 'Asistente Virtual Conversacional'
UNION ALL
SELECT p.id, 'Node.js' FROM projects p WHERE p.title = 'Asistente Virtual Conversacional'
UNION ALL
SELECT p.id, 'MongoDB' FROM projects p WHERE p.title = 'Asistente Virtual Conversacional'
UNION ALL
SELECT p.id, 'WebSocket' FROM projects p WHERE p.title = 'Asistente Virtual Conversacional'
ON CONFLICT DO NOTHING;

-- Valores de la empresa
INSERT INTO company_values (title, description, icon_name, display_order) VALUES
('Misión', 'Desarrollar soluciones tecnológicas innovadoras potenciadas por IA que transformen la manera en que las empresas operan y compiten en el mercado global.', 'target', 1),
('Visión', 'Ser la empresa de referencia mundial en desarrollo con IA, reconocida por crear tecnologías disruptivas que redefinan industrias completas.', 'lightbulb', 2),
('Valores', 'Innovación continua, excelencia técnica, compromiso con resultados medibles y desarrollo sostenible con impacto positivo.', 'award', 3)
ON CONFLICT (title) DO NOTHING;
EOF

echo "✅ Datos iniciales insertados"
echo "🎉 Configuración completada!"

