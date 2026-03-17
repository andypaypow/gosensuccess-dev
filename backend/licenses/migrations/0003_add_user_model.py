from django.db import migrations, models
import uuid


class Migration(migrations.Migration):
    dependencies = [
        ('licenses', '0002_add_max_devices'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('phone', models.CharField(max_length=20, unique=True)),
                ('email', models.EmailField(blank=True, null=True)),
                ('pin_code', models.CharField(max_length=10, blank=True)),
                ('session_token', models.CharField(max_length=100, unique=True, null=True, blank=True)),
                ('session_expires', models.DateTimeField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('max_devices', models.IntegerField(default=1)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_login', models.DateTimeField(blank=True, null=True)),
                ('license', models.OneToOneField('licenses.License', on_delete=models.SET_NULL, null=True, blank=True, related_name='user')),
            ],
            options={
                'verbose_name': 'Utilisateur',
                'verbose_name_plural': 'Utilisateurs',
            },
        ),
    ]
