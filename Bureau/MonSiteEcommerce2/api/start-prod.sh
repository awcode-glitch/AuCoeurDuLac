#!/bin/bash
# Lancement PRODUCTION (gunicorn)
cd "$(dirname "$0")"
source venv/bin/activate
exec gunicorn -c gunicorn.conf.py wsgi:app
