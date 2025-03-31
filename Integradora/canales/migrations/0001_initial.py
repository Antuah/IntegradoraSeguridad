# Generated by Django 5.1.5 on 2025-03-31 05:39

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Categoria',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=255, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Canal',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=255)),
                ('categoria', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='canales.categoria')),
            ],
        ),
    ]
