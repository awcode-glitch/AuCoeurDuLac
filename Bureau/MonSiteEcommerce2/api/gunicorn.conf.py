import multiprocessing
import os

# Adresse d'écoute
bind = f"0.0.0.0:{os.getenv('PORT', '5000')}"

# Nombre de workers : (2 x CPU) + 1
workers = multiprocessing.cpu_count() * 2 + 1

# Type de worker
worker_class = "sync"

# Timeout
timeout = 120

# Logs
accesslog = "-"   # stdout
errorlog  = "-"   # stderr
loglevel  = os.getenv("LOG_LEVEL", "info")

# Redémarre les workers après N requêtes (évite les fuites mémoire)
max_requests = 1000
max_requests_jitter = 100
