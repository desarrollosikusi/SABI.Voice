import os
import logging
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from database import SessionLocal
from core.rules_engine import OperationalRulesEngine

logger = logging.getLogger("rules_worker")
logger.setLevel(logging.INFO)

# Global stats for health check
worker_stats = {
    "is_enabled": os.getenv("RULE_ENGINE_ENABLED", "true").lower() == "true",
    "is_running": False,
    "dry_run": os.getenv("RULE_ENGINE_DRY_RUN", "false").lower() == "true",
    "last_run": None,
    "next_run": None,
    "avg_execution_time_ms": 0,
    "total_executions": 0,
    "last_error": None
}

# Create a singleton scheduler
scheduler = BackgroundScheduler()

def rules_worker_job():
    """
    Job that wakes up, injects DB session, evaluates rules, logs metrics, and finishes.
    """
    logger.info("Rules Engine Worker waking up...")
    db = SessionLocal()
    dry_run = worker_stats["dry_run"]
    try:
        engine = OperationalRulesEngine(db, dry_run=dry_run)
        metrics = engine.evaluate_all()
        
        exec_time = metrics.get('execution_time_ms', 0)
        worker_stats["last_run"] = datetime.now()
        worker_stats["total_executions"] += 1
        # Running average
        n = worker_stats["total_executions"]
        worker_stats["avg_execution_time_ms"] = (worker_stats["avg_execution_time_ms"] * (n - 1) + exec_time) / n
        
        logger.info(
            f"Rules Cycle Completed{' [DRY_RUN]' if dry_run else ''}: Evaluated={metrics.get('rules_evaluated', 0)}, "
            f"Triggered={metrics.get('rules_triggered', 0)}, "
            f"Transitions={metrics.get('transitions_executed', 0)}, "
            f"Events={metrics.get('events_published', 0)}, "
            f"Time={exec_time}ms"
        )
    except Exception as e:
        worker_stats["last_error"] = str(e)
        logger.error(f"Error executing rules engine cycle: {e}")
    finally:
        db.close()
    
def start_worker():
    """Starts the APScheduler with a 5-minute interval if enabled."""
    if not worker_stats["is_enabled"]:
        logger.info("Rules Engine Worker is DISABLED via environment variable.")
        return
        
    # We add the job if it hasn't been added yet
    if not scheduler.get_jobs():
        scheduler.add_job(rules_worker_job, 'interval', minutes=5, id="rules_engine_job")
    
    if not scheduler.running:
        scheduler.start()
        worker_stats["is_running"] = True
        logger.info("Rules Engine Worker started (Interval: 5 minutes)")

def stop_worker():
    """Stops the APScheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        worker_stats["is_running"] = False
        logger.info("Rules Engine Worker stopped")
