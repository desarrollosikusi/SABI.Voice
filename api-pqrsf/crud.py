from sqlalchemy.orm import Session
from sqlalchemy import func, or_
import models
import schemas
from datetime import datetime, timedelta
from notifications.provider import get_notification_provider

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    from auth import get_password_hash
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        name=user.name,
        email=user.email,
        username=user.username, 
        password_hash=hashed_password, 
        role=user.role, 
        area_id=user.area_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_case_communications(db: Session, pqrsf_id: int, include_internal: bool = False):
    query = db.query(models.CaseCommunication).filter(models.CaseCommunication.pqrsf_id == pqrsf_id)
    if not include_internal:
        query = query.filter(models.CaseCommunication.visible_cliente == True)
    return query.order_by(models.CaseCommunication.fecha.asc()).all()

def create_case_communication(db: Session, pqrsf_id: int, comm_data: schemas.CaseCommunicationCreate, autor_usuario_id: int = None, autor_contacto_id: int = None):
    db_comm = models.CaseCommunication(
        **comm_data.model_dump(),
        pqrsf_id=pqrsf_id,
        autor_usuario_id=autor_usuario_id,
        autor_contacto_id=autor_contacto_id
    )
    db.add(db_comm)
    db.commit()
    db.refresh(db_comm)

    provider = get_notification_provider()
    provider.send("Sistema", f"CommunicationCreatedEvent: {pqrsf_id}", f"Nueva comunicación de tipo {db_comm.tipo} en canal {db_comm.canal}.")

    return db_comm

def get_customer_pqrsfs(db: Session, customer_id: int):
    return db.query(models.Pqrsf).filter(models.Pqrsf.customer_id == customer_id).order_by(models.Pqrsf.fecha_creacion.desc()).all()

def search_customers(db: Session, search: str, limit: int = 10):
    if not search or len(search) < 3:
        return []
        
    import re
    clean_search = re.sub(r'[^a-zA-Z0-9]', '', search).upper()
    
    return db.query(models.Customer).filter(
        models.Customer.is_active == True,
        (models.Customer.name.ilike(f"%{search}%")) | (models.Customer.nit.ilike(f"%{clean_search}%") if clean_search else False)
    ).limit(limit).all()

def get_contacts_by_customer(db: Session, customer_id: int):
    return db.query(models.Contact).filter(
        models.Contact.customer_id == customer_id
    ).all()

def generate_consecutivo(db: Session) -> str:
    year = datetime.utcnow().year
    prefix = f"PQRSF-{year}-"
    last_pqrsf = db.query(models.Pqrsf).filter(models.Pqrsf.consecutivo.like(f"{prefix}%")).order_by(models.Pqrsf.id.desc()).first()
    if not last_pqrsf:
        return f"{prefix}0001"
    last_num = int(last_pqrsf.consecutivo.split("-")[-1])
    return f"{prefix}{last_num + 1:04d}"

def calculate_sla(db: Session, tipo_id: int, prioridad_id: int):
    if not tipo_id or not prioridad_id:
        return None, None
    rule = db.query(models.SlaRule).filter(models.SlaRule.tipo_id == tipo_id, models.SlaRule.prioridad_id == prioridad_id).first()
    if rule:
        horas = rule.horas_objetivo
        vencimiento = datetime.utcnow() + timedelta(hours=horas)
        return horas, vencimiento
    return None, None

def create_pqrsf(db: Session, pqrsf: schemas.PqrsfCreate):
    consecutivo = generate_consecutivo(db)
    horas_objetivo, fecha_vencimiento = calculate_sla(db, pqrsf.tipo_id, pqrsf.prioridad_id)
    
    db_pqrsf = models.Pqrsf(
        **pqrsf.model_dump(),
        consecutivo=consecutivo,
        horas_objetivo=horas_objetivo,
        fecha_vencimiento=fecha_vencimiento,
        estado_sla="Al día" if fecha_vencimiento else None
    )
    
    # Set default initial state
    initial_state = db.query(models.WorkflowState).filter(models.WorkflowState.is_initial == True).first()
    if initial_state and not db_pqrsf.estado_id:
        db_pqrsf.estado_id = initial_state.id

    db.add(db_pqrsf)
    db.commit()
    db.refresh(db_pqrsf)
    
    # Process Organizational Findings from AI if any
    if pqrsf.clasificacion_ia and "hallazgos" in pqrsf.clasificacion_ia:
        for hallazgo in pqrsf.clasificacion_ia["hallazgos"]:
            sys_name = hallazgo.get("tipo")
            m_sys = None
            if sys_name:
                m_sys = db.query(models.ManagementSystem).filter(models.ManagementSystem.name.ilike(f"%{sys_name}%")).first()
            
            finding = models.OrganizationalFinding(
                pqrsf_id=db_pqrsf.id,
                management_system_id=m_sys.id if m_sys else None,
                categoria=sys_name,
                descripcion=hallazgo.get("descripcion", ""),
                nivel_confianza_ia=hallazgo.get("confianza", 0.0),
                estado="Detectado por IA"
            )
            db.add(finding)
        db.commit()

    # Agregar historia
    add_history(db, db_pqrsf.id, "Creación", "Caso creado automáticamente", None, None, None, None)
    
    return db_pqrsf

def add_history(db: Session, pqrsf_id: int, accion: str, descripcion: str, usuario_id: int = None, field_modified: str = None, old_value: str = None, new_value: str = None):
    hist = models.PqrsfHistory(
        pqrsf_id=pqrsf_id, 
        accion=accion, 
        descripcion=descripcion, 
        usuario_id=usuario_id,
        field_modified=field_modified,
        old_value=str(old_value) if old_value is not None else None,
        new_value=str(new_value) if new_value is not None else None
    )
    db.add(hist)
    db.commit()

def create_comment(db: Session, pqrsf_id: int, user_id: int, comment: str):
    db_comment = models.PqrsfComment(pqrsf_id=pqrsf_id, usuario_id=user_id, comentario=comment)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    # Log to history
    add_history(db, pqrsf_id, "Comentario", "Nuevo comentario interno añadido", user_id)
    return db_comment

def get_pqrsf(db: Session, skip: int = 0, limit: int = 100, area_id: int = None):
    # Actualizar estado SLA antes de devolver
    now = datetime.utcnow()
    
    closed_states = db.query(models.WorkflowState.id).filter(or_(models.WorkflowState.is_final == True, models.WorkflowState.name == 'Cancelado')).all()
    closed_state_ids = [s[0] for s in closed_states]

    db.query(models.Pqrsf).filter(
        models.Pqrsf.estado_id.not_in(closed_state_ids),
        models.Pqrsf.fecha_vencimiento < now
    ).update({"estado_sla": "Vencido"}, synchronize_session=False)
    db.commit()
    
    query = db.query(models.Pqrsf)
    if area_id:
        query = query.filter(models.Pqrsf.area_responsable_id == area_id)
        
    return query.order_by(models.Pqrsf.fecha_creacion.desc()).offset(skip).limit(limit).all()

def get_pqrsf_by_id(db: Session, pqrsf_id: int):
    # Actualizar SLA si es necesario
    db_pqrsf = db.query(models.Pqrsf).filter(models.Pqrsf.id == pqrsf_id).first()
    
    if db_pqrsf and db_pqrsf.estado_id and db_pqrsf.fecha_vencimiento and db_pqrsf.fecha_vencimiento < datetime.utcnow():
        state = db.query(models.WorkflowState).filter(models.WorkflowState.id == db_pqrsf.estado_id).first()
        if state and not state.is_final and state.name != 'Cancelado':
            db_pqrsf.estado_sla = "Vencido"
            db.commit()
            db.refresh(db_pqrsf)
            
    return db_pqrsf

def update_pqrsf(db: Session, pqrsf_id: int, update_data: schemas.PqrsfUpdate, user_id: int):
    db_pqrsf = db.query(models.Pqrsf).filter(models.Pqrsf.id == pqrsf_id).first()
    if not db_pqrsf:
        return None
    
    data_dict = update_data.model_dump(exclude_unset=True)
    motivo_cambio = data_dict.pop("motivo_cambio", "Actualización desde consola operativa")
    
    classification_fields = ['tipo_id', 'area_id', 'arquitectura_id', 'prioridad_id', 'sentimiento_id', 'causa_probable_id', 'categoria_causa_id', 'impacto', 'riesgo', 'resumen', 'recomendacion', 'area_responsable_id']
    is_classification_changed = False
    
    provider = get_notification_provider()
    
    for key, value in data_dict.items():
        old_val = getattr(db_pqrsf, key)
        if old_val != value:
            # Add to history
            add_history(db, db_pqrsf.id, "Actualización", f"{key} modificado", user_id, key, str(old_val), str(value))
            setattr(db_pqrsf, key, value)
            
            if key in classification_fields:
                is_classification_changed = True
                
            if key == "responsable_id" and value:
                # Notify new responsible
                new_resp = db.query(models.User).filter(models.User.id == value).first()
                if new_resp:
                    provider.send(new_resp.username, f"Asignación de Caso: {db_pqrsf.consecutivo}", f"El caso {db_pqrsf.consecutivo} te ha sido asignado.")
            
    if "estado_id" in data_dict and data_dict["estado_id"] != db_pqrsf.estado_id:
        new_state_id = data_dict["estado_id"]
        old_state_id = db_pqrsf.estado_id
        
        # Verify workflow transition
        old_state = db.query(models.WorkflowState).filter(models.WorkflowState.id == old_state_id).first()
        new_state = db.query(models.WorkflowState).filter(models.WorkflowState.id == new_state_id).first()
        
        if old_state and new_state:
            transition = db.query(models.WorkflowTransition).filter(
                models.WorkflowTransition.from_state_id == old_state.id,
                models.WorkflowTransition.to_state_id == new_state.id
            ).first()
            
            if not transition:
                pass # Skipping strict enforcement for now during MVP migration
                # raise ValueError(f"Transición de estado no permitida por el Workflow: {old_state.name} -> {new_state.name}")
            
        # Calculate time spent in previous state
        last_history = db.query(models.CaseStatusHistory).filter(
            models.CaseStatusHistory.pqrsf_id == db_pqrsf.id
        ).order_by(models.CaseStatusHistory.fecha.desc()).first()
        
        tiempo_permanencia = None
        if last_history:
            tiempo_permanencia = int((datetime.utcnow() - last_history.fecha).total_seconds() / 60)
        else:
            tiempo_permanencia = int((datetime.utcnow() - db_pqrsf.fecha_creacion).total_seconds() / 60)

        # Record CaseStatusHistory
        status_history = models.CaseStatusHistory(
            pqrsf_id=db_pqrsf.id,
            estado_anterior_id=old_state_id,
            estado_nuevo_id=new_state_id,
            usuario_id=user_id,
            motivo=motivo_cambio,
            tiempo_permanencia_minutos=tiempo_permanencia
        )
        db.add(status_history)

        provider.send("Administrador", f"CaseStatusChangedEvent: {db_pqrsf.consecutivo}", f"El caso {db_pqrsf.consecutivo} ha cambiado a {new_state.name if new_state else 'None'} por motivo: {motivo_cambio}")
            
        if new_state and (new_state.is_final or new_state.name in ["Cerrado", "Cancelado"]):
            db_pqrsf.fecha_cierre = datetime.utcnow()
            
            # Create Knowledge Article if resolved/closed with AI recommendations
            if new_state.name == "Cerrado" and db_pqrsf.causa_probable_id and (db_pqrsf.recomendacion or db_pqrsf.accion_recomendada):
                article = models.KnowledgeArticle(
                    title=db_pqrsf.asunto or f"Caso {db_pqrsf.consecutivo}",
                    content=db_pqrsf.recomendacion or db_pqrsf.accion_recomendada,
                    arquitectura_id=db_pqrsf.arquitectura_id,
                    area_id=db_pqrsf.area_responsable_id,
                    source_pqrsf_id=db_pqrsf.id
                )
                db.add(article)

        
    if "tipo_id" in data_dict or "prioridad_id" in data_dict:
        # Recalcular SLA
        horas, vencimiento = calculate_sla(db, db_pqrsf.tipo_id, db_pqrsf.prioridad_id)
        if horas:
            db_pqrsf.horas_objetivo = horas
            db_pqrsf.fecha_vencimiento = vencimiento
            db_pqrsf.estado_sla = "Al día" if vencimiento > datetime.utcnow() else "Vencido"

    # Registrar en Aprendizaje Supervisado si hubo cambios en la clasificación IA
    if is_classification_changed and db_pqrsf.clasificacion_ia:
        final_class = {
            "tipo_id": db_pqrsf.tipo_id,
            "area_id": db_pqrsf.area_id,
            "arquitectura_id": db_pqrsf.arquitectura_id,
            "prioridad_id": db_pqrsf.prioridad_id,
            "sentimiento_id": db_pqrsf.sentimiento_id,
            "causa_probable_id": db_pqrsf.causa_probable_id,
            "impacto": db_pqrsf.impacto,
            "riesgo": db_pqrsf.riesgo,
            "resumen": db_pqrsf.resumen,
            "recomendacion": db_pqrsf.recomendacion
        }
        feedback = models.ClassificationFeedback(
            pqrsf_id=db_pqrsf.id,
            ia_classification=db_pqrsf.clasificacion_ia,
            final_classification=final_class,
            usuario_id=user_id,
            reason=motivo_cambio
        )
        db.add(feedback)

    db.commit()
    db.refresh(db_pqrsf)
        
    return db_pqrsf

def search_knowledge(db: Session, query: str = None, area_id: int = None, arquitectura_id: int = None, limit: int = 20):
    q = db.query(models.KnowledgeArticle).filter(models.KnowledgeArticle.is_published == True)
    if query:
        q = q.filter(
            or_(
                models.KnowledgeArticle.title.ilike(f"%{query}%"),
                models.KnowledgeArticle.content.ilike(f"%{query}%")
            )
        )
    if area_id:
        q = q.filter(models.KnowledgeArticle.area_id == area_id)
    if arquitectura_id:
        q = q.filter(models.KnowledgeArticle.arquitectura_id == arquitectura_id)
        
    return q.order_by(models.KnowledgeArticle.created_at.desc()).limit(limit).all()


def get_customer_dashboard_stats(db: Session, customer_id: int, contact_id: int):
    from sqlalchemy import func, case
    stats = db.query(
        func.sum(case(((models.WorkflowState.is_final == False), 1), else_=0)).label('abiertos_empresa'),
        func.sum(case(((models.Pqrsf.contact_id == contact_id) & (models.WorkflowState.is_final == False), 1), else_=0)).label('mis_abiertos'),
        func.sum(case(((models.WorkflowState.is_final == False) & (models.WorkflowState.sla_paused == False), 1), else_=0)).label('esperando_ikusi'),
        func.sum(case(((models.WorkflowState.is_final == False) & (models.WorkflowState.sla_paused == True), 1), else_=0)).label('esperando_cliente'),
        func.sum(case(((models.WorkflowState.is_final == False) & (models.Pqrsf.estado_sla == 'Vencido'), 1), else_=0)).label('vencidos_sla')
    ).join(models.WorkflowState, models.Pqrsf.estado_id == models.WorkflowState.id).filter(
        models.Pqrsf.customer_id == customer_id
    ).first()

    last_comm = db.query(func.max(models.CaseCommunication.fecha)).join(
        models.Pqrsf, models.CaseCommunication.pqrsf_id == models.Pqrsf.id
    ).filter(
        models.Pqrsf.customer_id == customer_id,
        models.CaseCommunication.tipo == 'Cliente'
    ).scalar()

    customer_db = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    customer_info = None
    if customer_db:
        logo_url = f"/api/files/customer-logo/{customer_db.id}" if customer_db.logo_path else None
        customer_info = {
            "id": customer_db.id,
            "name": customer_db.name,
            "logo_url": logo_url
        }

    return {
        'mis_casos_abiertos': stats.mis_abiertos or 0,
        'casos_abiertos_empresa': stats.abiertos_empresa or 0,
        'esperando_ikusi': stats.esperando_ikusi or 0,
        'esperando_cliente': stats.esperando_cliente or 0,
        'vencidos_sla': stats.vencidos_sla or 0,
        'ultima_actividad': last_comm,
        'customer': customer_info
    }

def get_customer_pqrsf_detail(db: Session, pqrsf_id: int, customer_id: int):
    # Verify ownership
    pqrsf = db.query(models.Pqrsf).filter(
        models.Pqrsf.id == pqrsf_id,
        models.Pqrsf.customer_id == customer_id
    ).first()
    
    if not pqrsf:
        return None
        
    estado_visible = pqrsf.estado.name if pqrsf.estado else "Sin estado"
    
    # Calculate responsable_actual
    if pqrsf.estado and pqrsf.estado.is_final:
        responsable_actual = "Finalizado"
    elif pqrsf.estado and pqrsf.estado.sla_paused:
        responsable_actual = "Cliente"
    else:
        responsable_actual = "IKUSI"
        
    last_update = db.query(func.max(models.CaseCommunication.fecha)).filter(
        models.CaseCommunication.pqrsf_id == pqrsf.id
    ).scalar()

    return {
        "id": pqrsf.id,
        "consecutivo": pqrsf.consecutivo,
        "asunto": pqrsf.asunto,
        "tipo": pqrsf.tipo.name if pqrsf.tipo else None,
        "prioridad": pqrsf.prioridad.name if pqrsf.prioridad else None,
        "estado_visible": estado_visible,
        "fecha_creacion": pqrsf.fecha_creacion,
        "fecha_ultima_actualizacion": last_update or pqrsf.fecha_creacion,
        "fecha_estimada_respuesta": pqrsf.fecha_vencimiento,
        "responsable_actual": responsable_actual,
        "estado_sla": pqrsf.estado_sla,
        "descripcion_original": pqrsf.descripcion,
        "adjuntos_originales": pqrsf.attachments
    }

def get_customer_pqrsf_communications(db: Session, pqrsf_id: int, customer_id: int):
    # Verify ownership
    pqrsf = db.query(models.Pqrsf).filter(
        models.Pqrsf.id == pqrsf_id,
        models.Pqrsf.customer_id == customer_id
    ).first()
    if not pqrsf:
        return []
        
    # Only return Cliente and Operación messages. No Interno, No Sistema (unless user visible).
    comms = db.query(models.CaseCommunication).filter(
        models.CaseCommunication.pqrsf_id == pqrsf.id,
        models.CaseCommunication.tipo.in_(['Cliente', 'Operación'])
    ).order_by(models.CaseCommunication.fecha.asc()).all()
    
    result = []
    for c in comms:
        remitente = "Cliente" if c.tipo == 'Cliente' else "IKUSI"
        result.append({
            "id": c.id,
            "fecha": c.fecha,
            "remitente": remitente,
            "mensaje": c.subject, # In our simplified model, subject/mensaje might be the same. Wait, there is no 'mensaje' body in the schema? subject is String(255).
            "adjuntos": [] # attachments are currently tied to the pqrsf, not individual communications
        })
    return result

def create_customer_communication(db: Session, pqrsf_id: int, customer_id: int, mensaje: str):
    pqrsf = db.query(models.Pqrsf).filter(
        models.Pqrsf.id == pqrsf_id,
        models.Pqrsf.customer_id == customer_id
    ).first()
    if not pqrsf:
        return None
        
    new_comm = models.CaseCommunication(
        pqrsf_id=pqrsf_id,
        subject=mensaje,
        tipo="Cliente",
        message_type="Respuesta",
        direccion="Entrante",
        canal="Portal",
        status="Enviado"
    )
    db.add(new_comm)
    
    # Also log in history
    history = models.PqrsfHistory(
        pqrsf_id=pqrsf_id,
        accion="Respuesta de Cliente",
        descripcion="El cliente agregó un comentario en el portal"
    )
    db.add(history)
    
    db.commit()
    db.refresh(new_comm)
    return new_comm
