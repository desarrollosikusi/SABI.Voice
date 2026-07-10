from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db
import worker

router = APIRouter()

@router.get("/status")
def get_rules_engine_status(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Devuelve el estado de salud y telemetría del Motor de Reglas (Background Worker)."""
    if current_user.role not in ["Administrador"]:
        pass # Podríamos restringir pero por ahora está bien solo para usuarios autenticados, lo ideal es admin

    # Calcular próxima ejecución desde APScheduler
    next_run = None
    if worker.worker_stats["is_running"]:
        job = worker.scheduler.get_job("rules_engine_job")
        if job and job.next_run_time:
            next_run = job.next_run_time.isoformat()

    active_rules_count = db.query(models.OperationalRule).filter(models.OperationalRule.is_active == True).count()

    return {
        "scheduler_activo": worker.worker_stats["is_running"],
        "habilitado_por_env": worker.worker_stats["is_enabled"],
        "dry_run": worker.worker_stats["dry_run"],
        "ultima_ejecucion": worker.worker_stats["last_run"].isoformat() if worker.worker_stats["last_run"] else None,
        "proxima_ejecucion": next_run,
        "numero_reglas_activas": active_rules_count,
        "tiempo_promedio_ejecucion_ms": round(worker.worker_stats["avg_execution_time_ms"], 2),
        "total_ejecuciones": worker.worker_stats["total_executions"],
        "ultimos_errores": worker.worker_stats["last_error"]
    }
