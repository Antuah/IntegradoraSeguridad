# Generated by Django 5.1.4 on 2025-04-14 02:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("contratos", "0002_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="contrato",
            name="direccion",
            field=models.TextField(default="sin direccion", max_length=200),
        ),
    ]
