#!/bin/bash
# Lancement DÉVELOPPEMENT (rechargement automatique)
cd "$(dirname "$0")"
source venv/bin/activate
python app.py
