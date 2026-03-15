#!/bin/bash
set -e

# Appliquer les migrations
python manage.py migrate --noinput || true

# Créer le superuser admin/admin
python manage.py shell << ENDOPYTHON
import os
from django.contrib.auth import get_user_model

User = get_user_model()
username = 'admin'
password = 'admin'
email = 'admin@gosensuccess.com'

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f'Superuser {username}/{password} created successfully')
else:
    user = User.objects.get(username=username)
    user.set_password(password)
    user.save()
    print(f'Superuser {username}/{password} password updated')
ENDOPYTHON

# Collecter les fichiers statiques
python manage.py collectstatic --noinput --clear 2>&1 || true

# Démarrer Gunicorn
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --access-logfile - --error-logfile -
