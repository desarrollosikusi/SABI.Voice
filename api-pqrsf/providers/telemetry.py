import time
import logging
from functools import wraps
from typing import Any

logger = logging.getLogger("sabi.providers")
logger.setLevel(logging.INFO)
# Basic console handler for Docker
ch = logging.StreamHandler()
ch.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
if not logger.handlers:
    logger.addHandler(ch)

def sanitize_args(args: tuple, kwargs: dict) -> tuple:
    """Removes sensitive keys from kwargs before logging."""
    safe_kwargs = kwargs.copy()
    sensitive_keys = ['password', 'secret', 'token', 'client_secret', 'credentials']
    for k in safe_kwargs.keys():
        if any(sec in k.lower() for sec in sensitive_keys):
            safe_kwargs[k] = "***REDACTED***"
            
    # For args, we can't easily introspect without knowing the signature, 
    # but we can try to redact obvious string tokens if needed.
    # We will assume args don't contain raw passwords unless they are dicts.
    safe_args = []
    for arg in args:
        if isinstance(arg, dict):
            safe_dict = arg.copy()
            for k in safe_dict.keys():
                if any(sec in k.lower() for sec in sensitive_keys):
                    safe_dict[k] = "***REDACTED***"
            safe_args.append(safe_dict)
        elif hasattr(arg, 'password') or hasattr(arg, 'client_secret'):
            # It's an object like OAuth2PasswordRequestForm
            safe_args.append("<SensitiveObject>")
        else:
            safe_args.append(arg)
            
    return tuple(safe_args), safe_kwargs

def observe_provider(system_name: str):
    """
    Decorator to log observability metrics for a Provider method.
    Logs: start, execution time, result status, errors, and external system.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            safe_args, safe_kwargs = sanitize_args(args[1:], kwargs) # args[0] is self
            logger.info(f"[PROVIDER START] System: {system_name} | Action: {func.__name__} | Args: {safe_args} {safe_kwargs}")
            
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                exec_time = time.time() - start_time
                # We don't log the full result to avoid PII/Secrets leak, just the type or success
                logger.info(f"[PROVIDER SUCCESS] System: {system_name} | Action: {func.__name__} | Time: {exec_time:.3f}s | ResultType: {type(result).__name__}")
                return result
            except Exception as e:
                exec_time = time.time() - start_time
                logger.error(f"[PROVIDER ERROR] System: {system_name} | Action: {func.__name__} | Time: {exec_time:.3f}s | Error: {type(e).__name__} - {str(e)}")
                raise e
        return wrapper
    return decorator
