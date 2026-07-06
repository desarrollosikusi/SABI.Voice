from pydantic import BaseModel
from typing import Optional, List
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
    area_id: Optional[int] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

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

class CustomerBase(BaseModel):
    name: str
    nit: Optional[str] = None
    criticality: str = "Estándar"
    sector: Optional[str] = None
    ciudad: Optional[str] = None
    pais: Optional[str] = None
    estado: Optional[str] = None
    fecha_alta_comercial: Optional[date] = None
    ejecutivo_cuenta_id: Optional[int] = None
    observaciones: Optional[str] = None
    notas_relacionamiento: Optional[str] = None
    is_active: bool = True

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
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
    es_principal: bool = False
    es_tecnico: bool = False
    es_administrativo: bool = False
    es_comercial: bool = False
    is_active: bool = True
    receives_notifications: bool = True
    authorized_for_pqrsf: bool = True

class ContactCreate(ContactBase):
    pass

class ContactResponse(ContactBase):
    id: int
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
    customer_id: Optional[int] = None
    contact_id: Optional[int] = None
    cliente_empresa: Optional[str] = None
    correo: Optional[str] = None
    asunto: Optional[str] = None
    descripcion: Optional[str] = None
    
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
    estado_id: Optional[int] = None
    tipo_id: Optional[int] = None
    area_id: Optional[int] = None
    arquitectura_id: Optional[int] = None
    prioridad_id: Optional[int] = None
    sentimiento_id: Optional[int] = None
    causa_probable_id: Optional[int] = None
    categoria_causa_id: Optional[int] = None
    area_responsable_id: Optional[int] = None
    responsable_id: Optional[int] = None
    impacto: Optional[str] = None
    riesgo: Optional[str] = None
    resumen: Optional[str] = None
    recomendacion: Optional[str] = None
    motivo_cambio: Optional[str] = None

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
    
    # Embedded catalog objects
    tipo_rel: Optional[PqrsfTypeResponse] = None
    area_rel: Optional[CatalogResponse] = None
    arquitectura_rel: Optional[CatalogResponse] = None
    prioridad_rel: Optional[PriorityResponse] = None
    estado_rel: Optional[WorkflowStateResponse] = None
    causa_probable_rel: Optional[CatalogResponse] = None
    categoria_causa_rel: Optional[CatalogResponse] = None
    sentimiento_rel: Optional[CatalogResponse] = None
    area_responsable_rel: Optional[CatalogResponse] = None
    
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

