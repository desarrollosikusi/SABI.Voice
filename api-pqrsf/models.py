from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey, func, JSON, Boolean, Float
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Area(Base):
    __tablename__ = "areas"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)

class Architecture(Base):
    __tablename__ = "architectures"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)

class CaseCategory(Base):
    __tablename__ = "case_categories"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    sequence_prefix = Column(String(10), nullable=True) # Prefijo del consecutivo, ej: PQRSF, SOL, AUD
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(20), default="#000000")
    icon = Column(String(50), default="Folder")
    workflow_id = Column(Integer, nullable=True) # Future use
    form_schema = Column(JSON, nullable=True) # Future use
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)

class CaseSource(Base):
    __tablename__ = "case_sources"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)

class PqrsfType(Base):
    __tablename__ = "pqrsf_types"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=True) # Temporarily nullable for migration
    name = Column(String(50), unique=True, nullable=False)
    plantilla_respuesta = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

class Priority(Base):
    __tablename__ = "priorities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    color = Column(String(20), default="#000000")
    horas_objetivo = Column(Integer, nullable=False)
    orden = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)

class ProbableCause(Base):
    __tablename__ = "probables_causes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)

class CauseCategory(Base):
    __tablename__ = "cause_categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)

class Sentiment(Base):
    __tablename__ = "sentiments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)

class GeneralParameter(Base):
    __tablename__ = "general_parameters"
    id = Column(Integer, primary_key=True, index=True)
    key_name = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(Text)

class IntegrationConfig(Base):
    __tablename__ = "integration_configs"
    id = Column(Integer, primary_key=True, index=True)
    provider_name = Column(String(100), unique=True, nullable=False)
    config_json = Column(Text)
    is_active = Column(Boolean, default=True)

class DashboardConfig(Base):
    __tablename__ = "dashboard_configs"
    id = Column(Integer, primary_key=True, index=True)
    key_name = Column(String(100), unique=True, nullable=False)
    value = Column(JSON, nullable=False)

class EconomicSector(Base):
    __tablename__ = "economic_sectors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    razon_social = Column(String(200), nullable=True)
    document_type = Column(String(20), default="NIT")
    nit = Column(String(50), index=True) # unique constraint removed for Sector Público Territorial rules
    criticality = Column(String(50), default="Estándar")
    sector = Column(String(100)) # Legacy, will be replaced by economic_sector_id
    economic_sector_id = Column(Integer, ForeignKey("economic_sectors.id", ondelete="SET NULL"), nullable=True)
    ciudad = Column(String(100), nullable=True)
    pais = Column(String(100), nullable=True)
    direccion_principal = Column(String(255), nullable=True)
    pagina_web = Column(String(255), nullable=True)
    telefono_principal = Column(String(50), nullable=True)
    estado = Column(String(50), nullable=True)
    fecha_alta_comercial = Column(Date, nullable=True)
    ejecutivo_cuenta_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    pm_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    sdm_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    observaciones = Column(Text)
    notas_relacionamiento = Column(Text, nullable=True)
    
    # Campos para Gestor Documental del Logo
    logo_path = Column(String(255), nullable=True)
    logo_filename = Column(String(255), nullable=True)
    logo_content_type = Column(String(50), nullable=True)
    logo_updated_at = Column(DateTime(timezone=True), nullable=True)
    
    is_active = Column(Boolean, default=True)

    contacts = relationship("Contact", back_populates="customer")
    pqrsfs = relationship("Pqrsf", back_populates="customer")
    economic_sector = relationship("EconomicSector")
    ejecutivo_cuenta = relationship("User", foreign_keys=[ejecutivo_cuenta_id])
    pm = relationship("User", foreign_keys=[pm_id])
    sdm = relationship("User", foreign_keys=[sdm_id])

class Contact(Base):
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True, index=True)
    functional_id = Column(String(50), unique=True, index=True, nullable=True) # nullable true initially to not break existing data
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"))
    name = Column(String(150), nullable=False)
    apellidos = Column(String(150), nullable=True)
    cargo = Column(String(100))
    area = Column(String(100), nullable=True)
    email = Column(String(150), nullable=False)
    password_hash = Column(String(255), nullable=True) # Initially nullable for existing ones
    phone = Column(String(50))
    celular = Column(String(50), nullable=True)
    fecha_nacimiento = Column(Date, nullable=True)
    idioma = Column(String(10), default='es')
    recibir_comunicaciones = Column(Boolean, default=True)
    medio_preferido = Column(String(50), nullable=True)
    notas_relacionamiento = Column(Text, nullable=True)
    
    es_principal = Column(Boolean, default=False)
    es_tecnico = Column(Boolean, default=False)
    es_administrativo = Column(Boolean, default=False)
    es_comercial = Column(Boolean, default=False)
    
    is_active = Column(Boolean, default=True)
    deactivation_reporter = Column(String(150), nullable=True)
    deactivation_support = Column(Text, nullable=True)
    deactivation_date = Column(DateTime, nullable=True)
    
    receives_notifications = Column(Boolean, default=True)
    authorized_for_pqrsf = Column(Boolean, default=True)

    additional_data = Column(JSON, nullable=True)

    customer = relationship("Customer", back_populates="contacts")
    history = relationship("ContactHistory", back_populates="contact")

class ContactHistory(Base):
    __tablename__ = "contact_history"
    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    field_name = Column(String(100), nullable=False)
    old_value = Column(String(255), nullable=True)
    new_value = Column(String(255), nullable=True)
    changed_at = Column(DateTime, default=datetime.datetime.utcnow)

    contact = relationship("Contact", back_populates="history")
    user = relationship("User")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(50), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    details = Column(JSON, nullable=True)
    
    user = relationship("User")
    customer = relationship("Customer")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="Administrador")
    job_title = Column(String(100), nullable=True)
    area_id = Column(Integer, ForeignKey("areas.id", ondelete="SET NULL"), nullable=True)
    phone = Column(String(50), nullable=True)
    avatar_url = Column(String(255), nullable=True)
    token_version = Column(Integer, default=1, nullable=False)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    
    area = relationship("Area")

class ManagementSystem(Base):
    __tablename__ = "management_systems"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)

class Process(Base):
    __tablename__ = "processes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    code = Column(String(50), unique=True)
    management_system_id = Column(Integer, ForeignKey("management_systems.id", ondelete="SET NULL"), nullable=True)
    responsable_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True)
    
    management_system = relationship("ManagementSystem")
    responsable = relationship("User")

class BusinessRule(Base):
    __tablename__ = "business_rules"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text)
    keywords = Column(Text)
    priority = Column(Integer, nullable=False)
    action_field = Column(String(50), nullable=False)
    action_value = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    execution_order = Column(Integer, nullable=False)

class WorkflowState(Base):
    __tablename__ = "workflow_states"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    is_initial = Column(Boolean, default=False)
    is_final = Column(Boolean, default=False)
    sla_paused = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

class WorkflowTransition(Base):
    __tablename__ = "workflow_transitions"
    id = Column(Integer, primary_key=True, index=True)
    from_state_id = Column(Integer, ForeignKey("workflow_states.id"))
    to_state_id = Column(Integer, ForeignKey("workflow_states.id"))
    allowed_roles = Column(String(255))
    require_note = Column(Boolean, default=False)
    require_assignment = Column(Boolean, default=False)
    require_evidence = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    from_state = relationship("WorkflowState", foreign_keys=[from_state_id])
    to_state = relationship("WorkflowState", foreign_keys=[to_state_id])

class OperationalRule(Base):
    __tablename__ = "operational_rules"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text)
    priority = Column(Integer, default=100)
    is_active = Column(Boolean, default=True)
    
    # Rules as Data
    entity_type = Column(String(50), default="pqrsf")  # e.g., "pqrsf", "customer"
    conditions = Column(JSON, nullable=False)          # Abstract JSON syntax tree for conditions
    action_type = Column(String(50), nullable=False)   # e.g., "PUBLISH_EVENT", "TRANSITION_STATE"
    action_payload = Column(JSON, nullable=False)      # Payload to execute the action

class RuleExecutionLog(Base):
    __tablename__ = "rule_execution_logs"
    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(Integer, ForeignKey("operational_rules.id", ondelete="CASCADE"), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=False)
    workflow_version = Column(String(50), nullable=True)
    execution_window = Column(String(50), nullable=False) # e.g., "2024-05-12T10" 
    executed_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    rule = relationship("OperationalRule")

class WorkflowStateVisibility(Base):
    __tablename__ = "workflow_state_visibility"
    id = Column(Integer, primary_key=True, index=True)
    workflow_state_id = Column(Integer, ForeignKey("workflow_states.id", ondelete="CASCADE"))
    client_state_name = Column(String(100), nullable=False)
    language = Column(String(10), default='es')

    workflow_state = relationship("WorkflowState")

class SlaRule(Base):
    __tablename__ = "sla_rules"
    id = Column(Integer, primary_key=True, index=True)
    tipo_id = Column(Integer, ForeignKey("pqrsf_types.id", ondelete="CASCADE"))
    prioridad_id = Column(Integer, ForeignKey("priorities.id", ondelete="CASCADE"))
    horas_objetivo = Column(Integer, nullable=False)
    arquitectura_id = Column(Integer, ForeignKey("architectures.id", ondelete="SET NULL"), nullable=True)
    area_id = Column(Integer, ForeignKey("areas.id", ondelete="SET NULL"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True)

    tipo = relationship("PqrsfType")
    prioridad = relationship("Priority")
    arquitectura = relationship("Architecture")
    area = relationship("Area")
    customer = relationship("Customer")

class Pqrsf(Base):
    __tablename__ = "pqrsf"
    id = Column(Integer, primary_key=True, index=True)
    consecutivo = Column(String(50), unique=True, index=True, nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.datetime.utcnow)
    
    category_id = Column(Integer, ForeignKey("case_categories.id"), nullable=True)
    source_id = Column(Integer, ForeignKey("case_sources.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)
    cliente_empresa = Column(String(150))
    correo = Column(String(150))
    
    asunto = Column(String(255))
    descripcion = Column(Text)
    fecha_limite_sugerida = Column(DateTime, nullable=True)
    
    tipo_id = Column(Integer, ForeignKey("pqrsf_types.id"))
    area_id = Column(Integer, ForeignKey("areas.id"))
    arquitectura_id = Column(Integer, ForeignKey("architectures.id"))
    prioridad_id = Column(Integer, ForeignKey("priorities.id"))
    sentimiento_id = Column(Integer, ForeignKey("sentiments.id"))
    causa_probable_id = Column(Integer, ForeignKey("probables_causes.id"))
    categoria_causa_id = Column(Integer, ForeignKey("cause_categories.id"))
    estado_id = Column(Integer, ForeignKey("workflow_states.id"))
    area_responsable_id = Column(Integer, ForeignKey("areas.id"))
    responsable_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    accion_recomendada = Column(Text)
    resumen = Column(Text)
    impacto = Column(Text)
    riesgo = Column(Text)
    recomendacion = Column(Text)
    
    clasificacion_ia = Column(JSON)
    clasificacion_final = Column(JSON)
    regla_aplicada_id = Column(Integer, ForeignKey("business_rules.id"))
    clasificacion_modificada = Column(Boolean, default=False)
    
    horas_objetivo = Column(Integer)
    fecha_vencimiento = Column(DateTime)
    estado_sla = Column(String(50))
    fecha_cierre = Column(DateTime, nullable=True)
    customer = relationship("Customer", back_populates="pqrsfs")
    contact = relationship("Contact")
    responsable = relationship("User", foreign_keys=[responsable_id])
    tipo = relationship("PqrsfType")
    area = relationship("Area", foreign_keys=[area_id])
    arquitectura = relationship("Architecture")
    prioridad = relationship("Priority")
    sentimiento = relationship("Sentiment")
    causa_probable = relationship("ProbableCause")
    categoria_causa = relationship("CauseCategory")
    estado = relationship("WorkflowState")
    area_responsable = relationship("Area", foreign_keys=[area_responsable_id])
    regla_aplicada = relationship("BusinessRule")
    
    attachments = relationship("PqrsfAttachment", back_populates="pqrsf")
    history = relationship("PqrsfHistory", back_populates="pqrsf")
    comments = relationship("PqrsfComment", back_populates="pqrsf")
    findings = relationship("OrganizationalFinding", back_populates="pqrsf")

class OrganizationalFinding(Base):
    __tablename__ = "organizational_findings"
    id = Column(Integer, primary_key=True, index=True)
    pqrsf_id = Column(Integer, ForeignKey("pqrsf.id", ondelete="CASCADE"))
    management_system_id = Column(Integer, ForeignKey("management_systems.id", ondelete="SET NULL"), nullable=True)
    categoria = Column(String(100))
    descripcion = Column(Text)
    nivel_confianza_ia = Column(Float, nullable=True)
    estado = Column(String(50), default="Detectado por IA")
    validado_por_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    fecha_validacion = Column(DateTime, nullable=True)
    
    pqrsf = relationship("Pqrsf", back_populates="findings")
    management_system = relationship("ManagementSystem")
    validado_por = relationship("User")

class PqrsfAttachment(Base):
    __tablename__ = "pqrsf_attachments"
    id = Column(Integer, primary_key=True, index=True)
    pqrsf_id = Column(Integer, ForeignKey("pqrsf.id", ondelete="CASCADE"))
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(255), nullable=False)
    content_type = Column(String(100))
    size = Column(Integer)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    pqrsf = relationship("Pqrsf", back_populates="attachments")

class PqrsfHistory(Base):
    __tablename__ = "pqrsf_history"
    id = Column(Integer, primary_key=True, index=True)
    pqrsf_id = Column(Integer, ForeignKey("pqrsf.id", ondelete="CASCADE"))
    fecha = Column(DateTime, default=datetime.datetime.utcnow)
    accion = Column(String(100), nullable=False)
    descripcion = Column(Text)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    field_modified = Column(String(100))
    old_value = Column(Text)
    new_value = Column(Text)

    pqrsf = relationship("Pqrsf", back_populates="history")
    usuario = relationship("User")

class PqrsfComment(Base):
    __tablename__ = "pqrsf_comments"
    id = Column(Integer, primary_key=True, index=True)
    pqrsf_id = Column(Integer, ForeignKey("pqrsf.id", ondelete="CASCADE"))
    usuario_id = Column(Integer, ForeignKey("users.id"))
    comentario = Column(Text, nullable=False)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)

    pqrsf = relationship("Pqrsf", back_populates="comments")
    usuario = relationship("User")

class ClassificationFeedback(Base):
    __tablename__ = "classification_feedback"
    id = Column(Integer, primary_key=True, index=True)
    pqrsf_id = Column(Integer, ForeignKey("pqrsf.id", ondelete="CASCADE"))
    ia_classification = Column(JSON)
    final_classification = Column(JSON)
    usuario_id = Column(Integer, ForeignKey("users.id"))
    reason = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class KnowledgeArticle(Base):
    __tablename__ = "knowledge_articles"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    arquitectura_id = Column(Integer, ForeignKey("architectures.id", ondelete="SET NULL"), nullable=True)
    area_id = Column(Integer, ForeignKey("areas.id", ondelete="SET NULL"), nullable=True)
    source_pqrsf_id = Column(Integer, ForeignKey("pqrsf.id", ondelete="SET NULL"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_published = Column(Boolean, default=True)

    arquitectura = relationship("Architecture")
    area = relationship("Area")

class CaseCommunication(Base):
    __tablename__ = "case_communications"
    id = Column(Integer, primary_key=True, index=True)
    pqrsf_id = Column(Integer, ForeignKey("pqrsf.id", ondelete="CASCADE"))
    subject = Column(String(255), nullable=True)
    tipo = Column(String(50)) # Cliente, Operación, Sistema, Interno
    message_type = Column(String(50)) # Solicitud, Respuesta, Información adicional, Requerimiento, Notificación, Nota interna, Cambio de estado, Sistema
    direccion = Column(String(50)) # Entrante, Saliente
    canal = Column(String(50)) # Portal, Correo, Teams, etc.
    status = Column(String(50), default="Enviado") # Enviado, Entregado, Leído, Respondido, Error
    autor_usuario_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    autor_contacto_id = Column(Integer, ForeignKey("contacts.id", ondelete="SET NULL"), nullable=True)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)
    mensaje = Column(Text, nullable=False)
    visible_cliente = Column(Boolean, default=True)
    read_at = Column(DateTime, nullable=True)
    read_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    pqrsf = relationship("Pqrsf")
    autor_usuario = relationship("User", foreign_keys=[autor_usuario_id])
    autor_contacto = relationship("Contact", foreign_keys=[autor_contacto_id])
    reader = relationship("User", foreign_keys=[read_by])
    attachments = relationship("CommunicationAttachment", back_populates="communication")

class CommunicationAttachment(Base):
    __tablename__ = "communication_attachments"
    id = Column(Integer, primary_key=True, index=True)
    communication_id = Column(Integer, ForeignKey("case_communications.id", ondelete="CASCADE"))
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    storage_provider = Column(String(50), default="Local")
    content_type = Column(String(100))
    size = Column(Integer)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    communication = relationship("CaseCommunication", back_populates="attachments")

class CaseStatusHistory(Base):
    __tablename__ = "case_status_history"
    id = Column(Integer, primary_key=True, index=True)
    pqrsf_id = Column(Integer, ForeignKey("pqrsf.id", ondelete="CASCADE"))
    estado_anterior_id = Column(Integer, ForeignKey("workflow_states.id", ondelete="SET NULL"), nullable=True)
    estado_nuevo_id = Column(Integer, ForeignKey("workflow_states.id", ondelete="CASCADE"))
    usuario_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)
    motivo = Column(String(255))
    tiempo_permanencia_minutos = Column(Integer, nullable=True)

    pqrsf = relationship("Pqrsf")
    estado_anterior = relationship("WorkflowState", foreign_keys=[estado_anterior_id])
    estado_nuevo = relationship("WorkflowState", foreign_keys=[estado_nuevo_id])
    usuario = relationship("User", foreign_keys=[usuario_id])

class OperationalEvent(Base):
    __tablename__ = "operational_events"
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=False) # e.g. PQRSF_CREATED, SLA_DUE, IA_RISK
    origin = Column(String(50), nullable=False) # e.g. PQRSF, IA, PLANVIEW, DIRECTORY
    severity = Column(String(50), nullable=False) # e.g. Crítico, Alto, Medio, Informativo
    status = Column(String(50), default="active") # active, resolved, dismissed
    channel = Column(String(50), nullable=True) # e.g. notification, command_center, teams, all
    entity_type = Column(String(50), nullable=True) # e.g. pqrsf, customer, contract
    entity_id = Column(Integer, nullable=True) # e.g. 148
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=True)
    payload = Column(JSON, nullable=True) # Stores dynamic data for the event (title, description, recommended_action, etc.)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    customer = relationship("Customer")
    receipts = relationship("EventReceipt", back_populates="event", cascade="all, delete-orphan")

class EventReceipt(Base):
    __tablename__ = "event_receipts"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("operational_events.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    read_at = Column(DateTime, nullable=True)
    archived_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    event = relationship("OperationalEvent", back_populates="receipts")
    user = relationship("User")
