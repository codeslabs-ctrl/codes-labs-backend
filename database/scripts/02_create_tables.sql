-- Script para crear las tablas de la base de datos
-- Ejecutar conectado a la base de datos codeslabs_db

-- PostgreSQL 16 tiene gen_random_uuid() nativo, no necesita extensión
-- Si prefieres usar uuid-ossp, primero instálala con: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de proyectos
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stat_key VARCHAR(100) NOT NULL,
    stat_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, stat_key)
);

-- Tabla de tecnologías de proyectos
CREATE TABLE IF NOT EXISTS project_technologies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    technology VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, technology)
);

-- Tabla de valores de la empresa (Misión, Visión, Valores)
CREATE TABLE IF NOT EXISTS company_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Tabla de contactos recibidos
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active);
CREATE INDEX IF NOT EXISTS idx_project_stats_project_id ON project_stats(project_id);
CREATE INDEX IF NOT EXISTS idx_project_technologies_project_id ON project_technologies(project_id);
CREATE INDEX IF NOT EXISTS idx_company_values_title ON company_values(title);
CREATE INDEX IF NOT EXISTS idx_company_values_is_active ON company_values(is_active);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email_contacto);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_values_updated_at BEFORE UPDATE ON company_values
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Datos iniciales de ejemplo (opcional)
INSERT INTO projects (title, description, category, icon_name, display_order) VALUES
('Sistema de Análisis Predictivo', 'Plataforma de IA para predicción de demanda y optimización de inventario en tiempo real para cadena de retail.', 'Machine Learning', 'bar-chart-3', 1),
('Asistente Virtual Conversacional', 'Chatbot multilenguaje con procesamiento de lenguaje natural para atención al cliente 24/7.', 'NLP & IA', 'bot', 2),
('Plataforma de Automatización', 'Suite completa de automatización de procesos empresariales con integración multi-sistema.', 'Automatización', 'rocket', 3),
('Sistema de Visión por Computadora', 'Detección y clasificación automática de productos en líneas de producción industrial.', 'Computer Vision', 'activity', 4)
ON CONFLICT DO NOTHING;

-- Insertar estadísticas de ejemplo
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

-- Insertar tecnologías de ejemplo
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

-- Insertar valores de la empresa
INSERT INTO company_values (title, description, icon_name, display_order) VALUES
('Misión', 'Desarrollar soluciones tecnológicas innovadoras potenciadas por IA que transformen la manera en que las empresas operan y compiten en el mercado global.', 'target', 1),
('Visión', 'Ser la empresa de referencia mundial en desarrollo con IA, reconocida por crear tecnologías disruptivas que redefinan industrias completas.', 'lightbulb', 2),
('Valores', 'Innovación continua, excelencia técnica, compromiso con resultados medibles y desarrollo sostenible con impacto positivo.', 'award', 3)
ON CONFLICT (title) DO NOTHING;

