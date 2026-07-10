import time
from functools import wraps
from fastapi import HTTPException

class CircuitBreakerOpenException(Exception):
    pass

class CircuitBreaker:
    def __init__(self, max_failures=3, reset_timeout=60, call_timeout=5, max_retries=1, fallback_func=None):
        self.max_failures = max_failures
        self.reset_timeout = reset_timeout
        self.call_timeout = call_timeout
        self.max_retries = max_retries
        self.fallback_func = fallback_func
        self.failures = 0
        self.last_failure_time = 0
        self.is_open = False

    def __call__(self, func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if self.is_open:
                if time.time() - self.last_failure_time > self.reset_timeout:
                    self.is_open = False
                    self.failures = 0
                else:
                    if self.fallback_func:
                        return self.fallback_func(*args, **kwargs)
                    raise CircuitBreakerOpenException("Circuit breaker is open. Service temporarily unavailable.")

            retries = 0
            while retries <= self.max_retries:
                try:
                    # Timeouts are tricky in pure Python threads, but we simulate the intention here.
                    # In a real async FastAPI app, we would use asyncio.wait_for
                    result = func(*args, **kwargs)
                    self.failures = 0
                    return result
                except Exception as e:
                    retries += 1
                    last_exception = e
                    time.sleep(0.5 * retries) # Exponential backoff

            self.failures += 1
            self.last_failure_time = time.time()
            if self.failures >= self.max_failures:
                self.is_open = True
                
            if self.fallback_func:
                return self.fallback_func(*args, **kwargs)
                
            raise last_exception
        return wrapper

# Simple in-memory cache for provider responses
# In production, this would be Redis.
_CACHE = {}
_CACHE_EXPIRY = {}

def cache_response(ttl_seconds=300):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Create a unique key based on function name and stringified args
            key = f"{func.__name__}:{str(args[1:])}:{str(kwargs)}"
            
            # Check cache
            if key in _CACHE and time.time() < _CACHE_EXPIRY.get(key, 0):
                return _CACHE[key]
                
            # Execute and cache
            result = func(*args, **kwargs)
            _CACHE[key] = result
            _CACHE_EXPIRY[key] = time.time() + ttl_seconds
            return result
        return wrapper
    return decorator
