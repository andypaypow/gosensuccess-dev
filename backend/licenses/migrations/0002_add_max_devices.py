from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('licenses', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='license',
            name='max_devices',
            field=models.IntegerField(default=1, help_text='Nombre d\'appareils autorisés à utiliser cette licence'),
        ),
        migrations.AddField(
            model_name='license',
            name='devices',
            field=models.JSONField(default=list, blank=True, help_text='Liste des device_ids autorisés'),
        ),
    ]
