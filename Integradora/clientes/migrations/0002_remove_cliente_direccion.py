# Generated by Django 5.1.4 on 2025-04-14 02:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("clientes", "0001_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="cliente",
            name="direccion",
        ),
    ]
