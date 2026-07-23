from pydantic import BaseModel, Field, field_validator, model_validator
import re
from typing import Optional, List, Any
from datetime import datetime, date

class CatalogBase(BaseModel):
    name: str
    is_active: bool = True

class CatalogResponse(CatalogBase):
    id: int
    class Config:
        from_attributes = True

# Specific Catalogs
class PriorityBase(CatalogBase):
    color: str = "#000000"
    horas_objetivo: int
    orden: int

class PriorityResponse(PriorityBase):
    id: int
    class Config:
        from_attributes = True

class PqrsfTypeBase(CatalogBase):
    code: Optional[str] = None
    plantilla_respuesta: Optional[str] = None

class PqrsfTypeResponse(PqrsfTypeBase):
    id: int
    class Config:
        from_attributes = True

class ManagementSystemBase(CatalogBase):
    description: Optional[str] = None

class ManagementSystemResponse(ManagementSystemBase):
    id: int
    class Config:
        from_attributes = True

class ProcessBase(BaseModel):
    name: str
    code: Optional[str] = None
    management_system_id: Optional[int] = None
    responsable_id: Optional[int] = None
    is_active: bool = True

class ProcessResponse(ProcessBase):
    id: int
    management_system: Optional[ManagementSystemResponse] = None
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    name: str
    email: str
    username: str
    role: str = "Administrador"
    job_title: Optional[str] = None
    area_id: Optional[int] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class UserUpdateAdmin(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    job_title: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    last_login: Optional[datetime] = None
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class SlaRuleBase(BaseModel):
    tipo_id: int
    prioridad_id: int
    horas_objetivo: int
    arquitectura_id: Optional[int] = None
    area_id: Optional[int] = None
    customer_id: Optional[int] = None

class SlaRuleResponse(SlaRuleBase):
    id: int
    class Config:
        from_attributes = True

class EconomicSectorBase(BaseModel):
    name: str
    is_active: bool = True
    order_index: int = 0

class EconomicSectorResponse(EconomicSectorBase):
    id: int
    class Config:
        from_attributes = True

class CaseCategoryBase(BaseModel):
    code: str
    sequence_prefix: Optional[str] = None
    name: str
    description: Optional[str] = None
    color: str = "#000000"
    icon: str = "Folder"
    workflow_id: Optional[int] = None
    form_schema: Optional[Any] = None
    is_active: bool = True
    display_order: int = 0

class CaseCategoryResponse(CaseCategoryBase):
    id: int
    class Config:
        from_attributes = True

class CaseSourceBase(BaseModel):
    code: str
    name: str
    is_active: bool = True

class CaseSourceResponse(CaseSourceBase):
    id: int
    class Config:
        from_attributes = True

import re

def normalize_customer_name(v: str) -> str:
    if not isinstance(v, str):
        return v
    words = v.split()
    normalized_words = []
    for word in words:
        # Longitud de caracteres alfabéticos solamente
        clean_word = re.sub(r'[^a-zA-ZáéíóúÁÉÍÓÚñÑ]', '', word)
        alpha_len = len(clean_word)
        
        if clean_word.upper() in ["SAS", "SA"]:
            normalized_words.append(word.upper())
        elif alpha_len > 3:
            normalized_words.append(word.capitalize())
        else:
            normalized_words.append(word.lower())
    return " ".join(normalized_words)

class CustomerBase(BaseModel):
    name: str

    @field_validator('name', mode='before')
    def validate_name(cls, v):
        return normalize_customer_name(v)

    razon_social: Optional[str] = None
    document_type: str = "NIT"
    nit: Optional[str] = None
    
    @model_validator(mode='before')
    @classmethod
    def clean_document(cls, data: Any) -> Any:
        if isinstance(data, dict):
            nit = data.get('nit')
            if nit:
                doc_type = data.get('document_type', 'NIT')
                if doc_type == 'NIT':
                    data['nit'] = re.sub(r'\D', '', str(nit))
                else:
                    data['nit'] = re.sub(r'[^a-zA-Z0-9]', '', str(nit)).upper()
        return data

    criticality: str = "Estándar"
    sector: Optional[str] = None
    economic_sector_id: Optional[int] = None
    ciudad: Optional[str] = None
    pais: Optional[str] = None
    direccion_principal: Optional[str] = None
    pagina_web: Optional[str] = None
    telefono_principal: Optional[str] = None
    estado: Optional[str] = None
    fecha_alta_comercial: Optional[date] = None
    ejecutivo_cuenta_id: Optional[int] = None
    pm_id: Optional[int] = None
    sdm_id: Optional[int] = None
    observaciones: Optional[str] = None
    notas_relacionamiento: Optional[str] = None
    
    logo_path: Optional[str] = None
    logo_filename: Optional[str] = None
    logo_content_type: Optional[str] = None
    logo_updated_at: Optional[datetime] = None
    
    is_active: bool = True

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None

    @field_validator('name', mode='before')
    def validate_name(cls, v):
        return normalize_customer_name(v) if v is not None else v

    razon_social: Optional[str] = None
    document_type: Optional[str] = None
    nit: Optional[str] = None
    
    @model_validator(mode='before')
    @classmethod
    def clean_document(cls, data: Any) -> Any:
        if isinstance(data, dict):
            nit = data.get('nit')
            if nit is not None:
                # If document_type isn't in update, we assume it's NIT or we strip what we can.
                doc_type = data.get('document_type', 'NIT')
                if doc_type == 'NIT':
                    data['nit'] = re.sub(r'\D', '', str(nit))
                else:
                    data['nit'] = re.sub(r'[^a-zA-Z0-9]', '', str(nit)).upper()
        return data

    estado: Optional[str] = None
    ciudad: Optional[str] = None
    pais: Optional[str] = None
    direccion_principal: Optional[str] = None
    pagina_web: Optional[str] = None
    telefono_principal: Optional[str] = None
    fecha_alta_comercial: Optional[date] = None
    economic_sector_id: Optional[int] = None
    pm_id: Optional[int] = None
    sdm_id: Optional[int] = None
    ejecutivo_cuenta_id: Optional[int] = None
    notas_relacionamiento: Optional[str] = None
    is_active: Optional[bool] = None

class CustomerResponse(CustomerBase):
    id: int
    ejecutivo_cuenta: Optional[UserResponse] = None
    pm: Optional[UserResponse] = None
    sdm: Optional[UserResponse] = None
    economic_sector: Optional[EconomicSectorResponse] = None
    
    # Extended metrics
    total_contactos: Optional[int] = None
    pqrsf_abiertas: Optional[int] = None
    pqrsf_cerradas: Optional[int] = None
    ultima_interaccion: Optional[datetime] = None

    class Config:
        from_attributes = True

class ContactBase(BaseModel):
    customer_id: int
    name: str
    apellidos: Optional[str] = None
    cargo: Optional[str] = None
    area: Optional[str] = None
    email: str
    phone: Optional[str] = None
    celular: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    idioma: str = "es"
    recibir_comunicaciones: bool = True
    medio_preferido: Optional[str] = None
    notas_relacionamiento: Optional[str] = None
    es_principal: bool = False
    es_tecnico: bool = False
    es_administrativo: bool = False
    es_comercial: bool = False
    is_active: bool = True
    receives_notifications: bool = True
    authorized_for_pqrsf: bool = True
    additional_data: Optional[dict] = None

    @field_validator('name', mode='before')
    @classmethod
    def strip_whitespace_name(cls, v):
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("El nombre no puede estar vacío")
        return v

    @field_validator('email', mode='before')
    @classmethod
    def normalize_email(cls, v):
        if isinstance(v, str):
            v = v.strip().lower()
            if not re.match(r"[^@]+@[^@]+\.[^@]+", v):
                raise ValueError("Formato de correo inválido")
        return v

    @field_validator('phone', 'celular', mode='before')
    @classmethod
    def sanitize_phone(cls, v):
        if isinstance(v, str):
            v = re.sub(r'[^\d+]', '', v)
        return v

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    apellidos: Optional[str] = None
    cargo: Optional[str] = None
    area: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    celular: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    idioma: Optional[str] = None
    medio_preferido: Optional[str] = None

class ContactCreate(ContactBase):
    pass

class ContactUpdateAdmin(BaseModel):
    name: Optional[str] = None
    apellidos: Optional[str] = None
    cargo: Optional[str] = None
    area: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    celular: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    idioma: Optional[str] = None
    medio_preferido: Optional[str] = None
    recibir_comunicaciones: Optional[bool] = None
    notas_relacionamiento: Optional[str] = None
    es_principal: Optional[bool] = None
    es_tecnico: Optional[bool] = None
    es_administrativo: Optional[bool] = None
    es_comercial: Optional[bool] = None
    receives_notifications: Optional[bool] = None
    authorized_for_pqrsf: Optional[bool] = None
    additional_data: Optional[dict] = None

    @field_validator('name', mode='before')
    @classmethod
    def strip_whitespace_name(cls, v):
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("El nombre no puede estar vacío")
        return v

    @field_validator('email', mode='before')
    @classmethod
    def normalize_email(cls, v):
        if isinstance(v, str):
            v = v.strip().lower()
            if not re.match(r"[^@]+@[^@]+\.[^@]+", v):
                raise ValueError("Formato de correo inválido")
        return v

    @field_validator('phone', 'celular', mode='before')
    @classmethod
    def sanitize_phone(cls, v):
        if isinstance(v, str):
            v = re.sub(r'[^\d+]', '', v)
        return v

class ContactDeactivate(BaseModel):
    deactivation_reporter: str
    deactivation_support: str

class CustomerBasic(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class ContactResponse(ContactBase):
    id: int
    functional_id: Optional[str] = None
    deactivation_reporter: Optional[str] = None
    deactivation_support: Optional[str] = None
    deactivation_date: Optional[datetime] = None
    customer: Optional[CustomerBasic] = None
    ultima_interaccion: Optional[datetime] = None
    class Config:
        from_attributes = True

class ContactHistoryResponse(BaseModel):
    id: int
    contact_id: int
    user_id: Optional[int] = None
    field_name: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    changed_at: datetime
    class Config:
        from_attributes = True

class BusinessRuleBase(BaseModel):
    name: str
    description: Optional[str] = None
    keywords: Optional[str] = None
    priority: int
    action_field: str
    action_value: str
    is_active: bool = True
    execution_order: int

class BusinessRuleResponse(BusinessRuleBase):
    id: int
    class Config:
        from_attributes = True

class WorkflowStateResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    is_initial: bool
    is_final: bool
    sla_paused: bool
    is_active: bool
    class Config:
        from_attributes = True

class PqrsfAttachmentResponse(BaseModel):
    id: int
    file_name: str
    size: Optional[int] = None
    uploaded_at: datetime
    class Config:
        from_attributes = True

class PqrsfHistoryResponse(BaseModel):
    id: int
    fecha: datetime
    accion: str
    descripcion: Optional[str] = None
    usuario_id: Optional[int] = None
    field_modified: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    class Config:
        from_attributes = True

class PqrsfCommentBase(BaseModel):
    comentario: str

class PqrsfCommentResponse(PqrsfCommentBase):
    id: int
    usuario_id: int
    fecha: datetime
    class Config:
        from_attributes = True

class OrganizationalFindingBase(BaseModel):
    management_system_id: Optional[int] = None
    categoria: Optional[str] = None
    descripcion: Optional[str] = None
    nivel_confianza_ia: Optional[float] = None
    estado: str = "Detectado por IA"

class OrganizationalFindingResponse(OrganizationalFindingBase):
    id: int
    pqrsf_id: int
    validado_por_id: Optional[int] = None
    fecha_validacion: Optional[datetime] = None
    management_system: Optional[ManagementSystemResponse] = None
    class Config:
        from_attributes = True

class PqrsfBase(BaseModel):
    category_id: Optional[int] = None
    source_id: Optional[int] = None
    customer_id: Optional[int] = None
    contact_id: Optional[int] = None
    cliente_empresa: Optional[str] = None
    correo: Optional[str] = None
    asunto: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_limite_sugerida: Optional[datetime] = None
    
    tipo_id: Optional[int] = None
    area_id: Optional[int] = None
    arquitectura_id: Optional[int] = None
    prioridad_id: Optional[int] = None
    sentimiento_id: Optional[int] = None
    causa_probable_id: Optional[int] = None
    categoria_causa_id: Optional[int] = None
    estado_id: Optional[int] = None
    area_responsable_id: Optional[int] = None
    responsable_id: Optional[int] = None
    
    accion_recomendada: Optional[str] = None
    resumen: Optional[str] = None
    impacto: Optional[str] = None
    riesgo: Optional[str] = None
    recomendacion: Optional[str] = None
    clasificacion_ia: Optional[dict] = None
    clasificacion_final: Optional[dict] = None
    regla_aplicada_id: Optional[int] = None
    clasificacion_modificada: Optional[bool] = False

class PqrsfCreate(PqrsfBase):
    pass

class PqrsfUpdate(BaseModel):
    tipo_id: Optional[int] = None
    area_id: Optional[int] = None
    arquitectura_id: Optional[int] = None
    prioridad_id: Optional[int] = None
    sentimiento_id: Optional[int] = None
    causa_probable_id: Optional[int] = None
    categoria_causa_id: Optional[int] = None
    estado_id: Optional[int] = None
    area_responsable_id: Optional[int] = None
    responsable_id: Optional[int] = None
    impacto: Optional[str] = None
    riesgo: Optional[str] = None
    resumen: Optional[str] = None
    recomendacion: Optional[str] = None
    motivo_cambio: Optional[str] = None
    nueva_nota: Optional[str] = None

class PqrsfReplyCreate(BaseModel):
    respuesta_cliente: str
    estado_id: Optional[int] = None
    motivo_cambio: Optional[str] = "Respuesta al cliente"

class PqrsfResponse(PqrsfBase):
    id: int
    consecutivo: str
    fecha_creacion: datetime
    horas_objetivo: Optional[int] = None
    fecha_vencimiento: Optional[datetime] = None
    estado_sla: Optional[str] = None
    fecha_cierre: Optional[datetime] = None
    respuesta_cliente: Optional[str] = None
    fecha_respuesta: Optional[datetime] = None
    respondido_por_id: Optional[int] = None
    
    # Embedded catalog objects (legacy, kept for backwards compatibility)
    tipo_rel: Optional[PqrsfTypeResponse] = None
    area_rel: Optional[CatalogResponse] = None
    arquitectura_rel: Optional[CatalogResponse] = None
    prioridad_rel: Optional[PriorityResponse] = None
    estado_rel: Optional[WorkflowStateResponse] = None
    causa_probable_rel: Optional[CatalogResponse] = None
    categoria_causa_rel: Optional[CatalogResponse] = None
    sentimiento_rel: Optional[CatalogResponse] = None
    area_responsable_rel: Optional[CatalogResponse] = None
    
    # New Standard Embedded objects
    customer: Optional[CustomerResponse] = None
    contact: Optional[ContactResponse] = None
    responsable: Optional[UserResponse] = None
    
    attachments: List[PqrsfAttachmentResponse] = []
    history: List[PqrsfHistoryResponse] = []
    comments: List[PqrsfCommentResponse] = []
    findings: List[OrganizationalFindingResponse] = []
    class Config:
        from_attributes = True

# (Omitted Dashboard Stats for brevity in this replace, we can keep them the same but using IDs where applicable)
# Wait, I should not omit them, I am replacing the whole file!
class DashboardStats(BaseModel):
    total_casos: int
    abiertos: int
    cerrados: int
    vencidos: int
    tiempo_promedio_horas: float
    variacion_porcentual_casos: float
    riesgos_activos: int
    por_tipo: dict
    por_area: dict
    por_arquitectura: dict
    mapa_calor: List[dict]
    ia_precision: Optional[dict] = None

class ExecutiveSummary(DashboardStats):
    top_clientes: List[dict]
    clientes_estrategicos_afectados: List[dict]
    top_causas: List[dict]

class RootCauseItem(BaseModel):
    causa_probable: str
    cantidad: int
    accion_recomendada: str

class RootCauseResponse(BaseModel):
    top_causes: List[RootCauseItem]
    trend: List[dict]
    by_architecture: List[dict]
    by_area: List[dict]

class RecomendacionIA(BaseModel):
    accion: str
    impacto: str
    prioridad: str
    area_responsable: str

class ExecutiveInsight(BaseModel):
    insights: List[str]
    recomendaciones: List[RecomendacionIA]

class KnowledgeArticleBase(BaseModel):
    title: str
    content: str
    arquitectura_id: Optional[int] = None
    area_id: Optional[int] = None
    source_pqrsf_id: Optional[int] = None
    is_published: bool = True

class KnowledgeArticleCreate(KnowledgeArticleBase):
    pass

class KnowledgeArticleResponse(KnowledgeArticleBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class WorkflowStateVisibilityBase(BaseModel):
    workflow_state_id: int
    client_state_name: str
    language: str = "es"

class WorkflowStateVisibilityResponse(WorkflowStateVisibilityBase):
    id: int
    class Config:
        from_attributes = True

class CommunicationAttachmentBase(BaseModel):
    file_name: str
    file_path: str
    storage_provider: str = "Local"
    content_type: Optional[str] = None
    size: Optional[int] = None

class CommunicationAttachmentResponse(CommunicationAttachmentBase):
    id: int
    communication_id: int
    uploaded_at: datetime
    class Config:
        from_attributes = True

class CaseCommunicationBase(BaseModel):
    subject: Optional[str] = None
    tipo: str
    message_type: str
    direccion: str
    canal: str
    status: str = "Enviado"
    mensaje: str
    visible_cliente: bool = True

class CaseCommunicationCreate(CaseCommunicationBase):
    pass

class CaseCommunicationResponse(CaseCommunicationBase):
    id: int
    pqrsf_id: int
    autor_usuario_id: Optional[int] = None
    autor_contacto_id: Optional[int] = None
    fecha: datetime
    read_at: Optional[datetime] = None
    read_by: Optional[int] = None
    attachments: List[CommunicationAttachmentResponse] = []

    class Config:
        from_attributes = True

# ==========================================
# WORKFLOW TRANSITION SCHEMAS
# ==========================================

class WorkflowTransitionResponse(BaseModel):
    id: int
    from_state_id: int
    to_state_id: int
    to_state_name: str
    allowed_roles: str
    require_note: bool
    require_assignment: bool
    require_evidence: bool

class PqrsfTransitionRequest(BaseModel):
    to_state_id: int
    note: Optional[str] = None
    assigned_to: Optional[int] = None
    evidence_url: Optional[str] = None

class CaseStatusHistoryBase(BaseModel):
    estado_anterior_id: Optional[int] = None
    estado_nuevo_id: int
    motivo: Optional[str] = None

class CaseStatusHistoryResponse(CaseStatusHistoryBase):
    id: int
    pqrsf_id: int
    usuario_id: Optional[int] = None
    fecha: datetime
    tiempo_permanencia_minutos: Optional[int] = None
    
    class Config:
        from_attributes = True

class TokenData(BaseModel):
    user_type: str
    roles: List[str] = []
    user_id: Optional[int] = None
    area: Optional[str] = None
    customer_id: Optional[int] = None
    contact_id: Optional[int] = None

class CustomerInfo(BaseModel):
    id: int
    name: str
    logo_url: Optional[str] = None

class CustomerDashboardResponse(BaseModel):
    mis_casos_abiertos: int
    casos_abiertos_empresa: int
    esperando_ikusi: int
    esperando_cliente: int
    vencidos_sla: int
    ultima_actividad: Optional[datetime] = None
    customer: Optional[CustomerInfo] = None

# Nuevos DTOs para el Portal Cliente
class CustomerCommunicationResponse(BaseModel):
    id: int
    fecha: datetime
    remitente: str # 'Cliente' o 'IKUSI'
    mensaje: Optional[str] = None
    adjuntos: List[PqrsfAttachmentResponse] = []
    
    class Config:
        from_attributes = True

class CustomerCommunicationCreate(BaseModel):
    mensaje: str

class CustomerPqrsfDetailResponse(BaseModel):
    id: int
    consecutivo: str
    asunto: Optional[str] = None
    tipo: Optional[str] = None
    prioridad: Optional[str] = None
    estado_visible: Optional[str] = None
    fecha_creacion: datetime
    fecha_ultima_actualizacion: Optional[datetime] = None
    fecha_estimada_respuesta: Optional[datetime] = None
    responsable_actual: str # "IKUSI" o "Cliente"
    estado_sla: Optional[str] = None
    descripcion_original: Optional[str] = None
    
    # Nested fields
    adjuntos_originales: List[PqrsfAttachmentResponse] = []
    
    class Config:
        from_attributes = True
