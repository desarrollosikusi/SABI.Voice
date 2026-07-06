-- Catálogos Maestros Generales
CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE architectures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE pqrsf_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE priorities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(20) DEFAULT '#000000',
    horas_objetivo INTEGER NOT NULL,
    orden INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE probables_causes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE cause_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE sentiments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE general_parameters (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT
);

CREATE TABLE integration_configs (
    id SERIAL PRIMARY KEY,
    provider_name VARCHAR(100) UNIQUE NOT NULL,
    config_json TEXT, -- Cifrado mock/base64
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE dashboard_configs (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL
);

-- Creación de tabla de usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Administrador', -- Administrador, Coordinador, Analista, Consulta
    area_id INTEGER REFERENCES areas(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP
);

-- Nuevos Catálogos Organizacionales
CREATE TABLE management_systems (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE processes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE,
    management_system_id INTEGER REFERENCES management_systems(id) ON DELETE SET NULL,
    responsable_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Reglas de Negocio (Base de datos)
CREATE TABLE business_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    keywords TEXT, -- Comma separated or regex
    priority INTEGER NOT NULL,
    action_field VARCHAR(50) NOT NULL, -- ej. 'tipo_id', 'area_id'
    action_value VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    execution_order INTEGER NOT NULL
);

-- Workflows and States
CREATE TABLE workflow_states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_initial BOOLEAN DEFAULT FALSE,
    is_final BOOLEAN DEFAULT FALSE,
    sla_paused BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE workflow_transitions (
    id SERIAL PRIMARY KEY,
    from_state_id INTEGER REFERENCES workflow_states(id),
    to_state_id INTEGER REFERENCES workflow_states(id),
    allowed_roles VARCHAR(255), -- Comma separated roles that can do this transition, or '*'
    UNIQUE(from_state_id, to_state_id)
);

-- Reglas SLA
CREATE TABLE sla_rules (
    id SERIAL PRIMARY KEY,
    tipo_id INTEGER REFERENCES pqrsf_types(id) ON DELETE CASCADE,
    prioridad_id INTEGER REFERENCES priorities(id) ON DELETE CASCADE,
    horas_objetivo INTEGER NOT NULL,
    arquitectura_id INTEGER REFERENCES architectures(id) ON DELETE SET NULL,
    area_id INTEGER REFERENCES areas(id) ON DELETE SET NULL,
    customer_id INTEGER, -- FK agregada abajo
    UNIQUE(tipo_id, prioridad_id, arquitectura_id, area_id, customer_id)
);

-- Tabla de clientes (Catálogo corporativo)
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    nit VARCHAR(50) UNIQUE,
    criticality VARCHAR(50) DEFAULT 'Estándar', -- Estratégico, Alto Valor, Estándar
    sector VARCHAR(100),
    observaciones TEXT,
    is_active BOOLEAN DEFAULT TRUE
);
ALTER TABLE sla_rules ADD CONSTRAINT fk_sla_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

-- Tabla de contactos por cliente
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    cargo VARCHAR(100),
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    receives_notifications BOOLEAN DEFAULT TRUE,
    authorized_for_pqrsf BOOLEAN DEFAULT TRUE,
    UNIQUE(customer_id, email)
);

-- Datos semilla iniciales de catálogos
INSERT INTO areas (name) VALUES ('Comercial'), ('Preventa'), ('Capital Humano'), ('Team SGI'), ('Gestión Administrativa'), ('Operaciones - PMO'), ('Operaciones - SMO'), ('Operaciones - Delivery'), ('Operaciones - Soporte y Helpdesk'), ('Operaciones - Servicios Administrados'), ('Operaciones - Customer Experience');
INSERT INTO architectures (name) VALUES ('Enterprise Networking'), ('Datacenter'), ('Seguridad'), ('Cloud'), ('Colaboración'), ('Servicios Administrados');
INSERT INTO pqrsf_types (name) VALUES ('Petición'), ('Queja'), ('Reclamo'), ('Solicitud'), ('Felicitación'), ('Incidente'), ('Problema'), ('Consulta');
INSERT INTO priorities (name, color, horas_objetivo, orden) VALUES ('Crítica', '#ff0000', 4, 1), ('Alta', '#ff8800', 12, 2), ('Media', '#ffff00', 24, 3), ('Baja', '#00ff00', 48, 4);
INSERT INTO sentiments (name) VALUES ('Positivo'), ('Negativo'), ('Neutral');
INSERT INTO cause_categories (name) VALUES ('Infraestructura'), ('Software'), ('Proceso'), ('Humano');
INSERT INTO probables_causes (name) VALUES ('Falla de Hardware'), ('Falla de Enlace'), ('Error de Configuración'), ('Caída de Servicio');

INSERT INTO management_systems (name, description) VALUES 
('Calidad', 'Sistema de Gestión de Calidad'),
('Seguridad de la Información', 'Sistema de Gestión de Seguridad de la Información'),
('Continuidad del Negocio', 'Sistema de Gestión de Continuidad del Negocio (BCM)'),
('SST', 'Sistema de Gestión de Seguridad y Salud en el Trabajo'),
('Ambiental', 'Sistema de Gestión Ambiental'),
('Compliance', 'Cumplimiento Normativo'),
('Experiencia del Cliente', 'Customer Experience (CX)'),
('Innovación', 'Gestión de la Innovación');

INSERT INTO customers (name, nit, criticality) VALUES
('Ecopetrol', '899999068-1', 'Estratégico'),
('Bancolombia', '890903938-8', 'Estratégico'),
('Claro', '800153993-7', 'Alto Valor'),
('IKUSI', '900000000-1', 'Estándar'),
('Coca Cola', NULL, 'Estándar'),
('Colombiana', NULL, 'Estándar'),
('Pepsico', NULL, 'Estándar'),
('Pomar', NULL, 'Estándar');

INSERT INTO contacts (customer_id, name, email, authorized_for_pqrsf) VALUES
(1, 'Contacto Ecopetrol 1', 'contacto1@ecopetrol.com.co', TRUE),
(1, 'Contacto Ecopetrol 2', 'contacto2@ecopetrol.com.co', FALSE),
(2, 'Juan Perez', 'jperez@bancolombia.com', TRUE),
(3, 'Admin Claro', 'admin@claro.com.co', TRUE),
(5, 'Maira Gomez', 'Maira.gomez@cocacola.com', TRUE),
(5, 'Pedro Perez', 'pedro.perez@cocacola.com', TRUE),
(5, 'Julian Rodriguez', 'julian.rodriguez@cocacola.com', TRUE),
(6, 'Maira Gomez', 'Maira.gomez@colombiana.com', TRUE),
(6, 'Pedro Perez', 'pedro.perez@colombiana.com', TRUE),
(6, 'Julian Rodriguez', 'julian.rodriguez@colombiana.com', TRUE),
(7, 'Maira Gomez', 'Maira.gomez@pepsico.com', TRUE),
(7, 'Pedro Perez', 'pedro.perez@pepsico.com', TRUE),
(7, 'Julian Rodriguez', 'julian.rodriguez@pepsico.com', TRUE),
(8, 'Maira Gomez', 'Maira.gomez@pomar.com', TRUE),
(8, 'Pedro Perez', 'pedro.perez@pomar.com', TRUE),
(8, 'Julian Rodriguez', 'julian.rodriguez@pomar.com', TRUE);

INSERT INTO workflow_states (name, is_initial, is_final, sla_paused) VALUES 
('Registrado', TRUE, FALSE, FALSE),
('Clasificado IA', FALSE, FALSE, FALSE),
('Validado', FALSE, FALSE, FALSE),
('Asignado', FALSE, FALSE, FALSE),
('En Gestión', FALSE, FALSE, FALSE),
('Pendiente Cliente', FALSE, FALSE, TRUE),
('Escalado', FALSE, FALSE, FALSE),
('Resuelto', FALSE, FALSE, FALSE),
('Cerrado', FALSE, TRUE, TRUE),
('Cancelado', FALSE, TRUE, TRUE);

INSERT INTO workflow_transitions (from_state_id, to_state_id, allowed_roles) VALUES
(1, 2, '*'), (1, 10, '*'), (2, 3, '*'), (2, 4, '*'), (3, 4, '*'), (4, 5, '*'), (5, 6, '*'), (6, 5, '*'), (5, 7, '*'), (7, 5, '*'), (5, 8, '*'), (8, 9, '*'), (8, 5, '*');

-- Tabla principal de PQRSF con FKs
CREATE TABLE pqrsf (
    id SERIAL PRIMARY KEY,
    consecutivo VARCHAR(50) UNIQUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    customer_id INTEGER REFERENCES customers(id),
    contact_id INTEGER REFERENCES contacts(id),
    cliente_empresa VARCHAR(150), -- redundancia
    correo VARCHAR(150), -- redundancia
    asunto VARCHAR(255),
    descripcion TEXT,
    
    tipo_id INTEGER REFERENCES pqrsf_types(id),
    area_id INTEGER REFERENCES areas(id),
    arquitectura_id INTEGER REFERENCES architectures(id),
    prioridad_id INTEGER REFERENCES priorities(id),
    sentimiento_id INTEGER REFERENCES sentiments(id),
    causa_probable_id INTEGER REFERENCES probables_causes(id),
    categoria_causa_id INTEGER REFERENCES cause_categories(id),
    estado_id INTEGER REFERENCES workflow_states(id),
    area_responsable_id INTEGER REFERENCES areas(id),
    responsable_id INTEGER REFERENCES users(id),

    accion_recomendada TEXT,
    resumen TEXT,
    impacto TEXT,
    riesgo TEXT,
    recomendacion TEXT,
    
    clasificacion_ia JSONB,
    clasificacion_final JSONB,
    regla_aplicada_id INTEGER REFERENCES business_rules(id),
    clasificacion_modificada BOOLEAN DEFAULT FALSE,
    
    horas_objetivo INTEGER,
    fecha_vencimiento TIMESTAMP,
    estado_sla VARCHAR(50), -- 'Al día', 'Próximo a vencer', 'Vencido'
    fecha_cierre TIMESTAMP
);

-- Dimensión Organizacional: Hallazgos
CREATE TABLE organizational_findings (
    id SERIAL PRIMARY KEY,
    pqrsf_id INTEGER REFERENCES pqrsf(id) ON DELETE CASCADE,
    management_system_id INTEGER REFERENCES management_systems(id) ON DELETE SET NULL,
    categoria VARCHAR(100),
    descripcion TEXT,
    nivel_confianza_ia FLOAT,
    estado VARCHAR(50) DEFAULT 'Detectado por IA', -- Detectado por IA, Confirmado, Descartado, Convertido...
    validado_por_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    fecha_validacion TIMESTAMP
);

-- Tabla para adjuntos
CREATE TABLE pqrsf_attachments (
    id SERIAL PRIMARY KEY,
    pqrsf_id INTEGER REFERENCES pqrsf(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    size INTEGER,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para el historial/trazabilidad
CREATE TABLE pqrsf_history (
    id SERIAL PRIMARY KEY,
    pqrsf_id INTEGER REFERENCES pqrsf(id) ON DELETE CASCADE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accion VARCHAR(100) NOT NULL,
    descripcion TEXT,
    usuario_id INTEGER REFERENCES users(id),
    field_modified VARCHAR(100),
    old_value TEXT,
    new_value TEXT
);

-- Tabla para Comentarios Internos
CREATE TABLE pqrsf_comments (
    id SERIAL PRIMARY KEY,
    pqrsf_id INTEGER REFERENCES pqrsf(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES users(id),
    comentario TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Aprendizaje Supervisado
CREATE TABLE classification_feedback (
    id SERIAL PRIMARY KEY,
    pqrsf_id INTEGER REFERENCES pqrsf(id) ON DELETE CASCADE,
    ia_classification JSONB,
    final_classification JSONB,
    usuario_id INTEGER REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Base de Conocimiento (Knowledge Base)
CREATE TABLE knowledge_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    arquitectura_id INTEGER REFERENCES architectures(id) ON DELETE SET NULL,
    area_id INTEGER REFERENCES areas(id) ON DELETE SET NULL,
    source_pqrsf_id INTEGER REFERENCES pqrsf(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT TRUE
);
