#!/bin/bash
set -e

# Attendre que la base de données soit prête (si nécessaire)
# Pour SQLite, pas d'attente nécessaire

# Créer les migrations si elles n'existent pas
python manage.py makemigrations --noinput || true

# Appliquer les migrations
python manage.py migrate --noinput

# Créer le superuser s'il n'existe pas
python manage.py shell << ENDOPYTHON
import os
from django.contrib.auth import get_user_model

User = get_user_model()
username = os.environ.get('ADMIN_USERNAME', 'admin')
password = os.environ.get('ADMIN_PASSWORD', 'admin123')
email = os.environ.get('ADMIN_EMAIL', 'admin@gosensuccess.com')

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f'Superuser {username} created successfully')
else:
    print(f'Superuser {username} already exists')
ENDOPYTHON

# Collecter les fichiers statiques
python manage.py collectstatic --noinput --clear

# Démarrer Gunicorn
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --access-logfile - --error-logfile -
