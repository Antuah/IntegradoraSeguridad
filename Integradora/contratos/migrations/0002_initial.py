# Generated by Django 5.1.5 on 2025-03-31 05:40

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('contratos', '0001_initial'),
        ('paquetes', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='contrato',
            name='paquete',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='paquetes.paquete'),
        ),
    ]
