# usuarios/migrations/0003_crear_rol_grupo_promotor.py
# (Versión SIMPLIFICADA: Solo Crea Rol y Grupo)

from django.db import migrations

def crear_rol_grupo_promotor_simple(apps, schema_editor):
    """
    Versión SIMPLIFICADA: Solo crea el Rol 'Promotor' y el Grupo 'Promotor'.
    La asignación de permisos se hará vía señal post_migrate.
    """
    Rol = apps.get_model('usuarios', 'Rol')
    Group = apps.get_model('auth', 'Group')

    print("\n--- Ejecutando migración SIMPLIFICADA para crear Rol/Grupo Promotor ---")

    # 1. Crear/Obtener Rol 'Promotor'
    print("Buscando/Creando Rol 'Promotor'...")
    rol_promotor, created_rol = Rol.objects.get_or_create(
        nombre='Promotor',
        defaults={'descripcion': 'Usuario con permisos definidos post-migración.'} # Desc actualizada
    )
    if created_rol: print("Rol 'Promotor' creado.")
    else: print("Rol 'Promotor' ya existía.")

    # 2. Crear/Obtener Grupo 'Promotor'
    print("Buscando/Creando Grupo 'Promotor'...")
    grupo_promotor, created_group = Group.objects.get_or_create(name='Promotor')
    if created_group: print("Grupo 'Promotor' creado.")
    else: print("Grupo 'Promotor' ya existía.")

    print("--- Fin migración SIMPLIFICADA Rol/Grupo Promotor ---")


# Función de reversión simplificada (solo borra rol y grupo)
def eliminar_rol_grupo_promotor_simple(apps, schema_editor):
    Rol = apps.get_model('usuarios', 'Rol')
    Group = apps.get_model('auth', 'Group')
    print("\nRevirtiendo migración: Eliminando Rol y Grupo 'Promotor'...")
    # Usamos filter().delete() para no fallar si no existen
    Group.objects.filter(name='Promotor').delete()
    Rol.objects.filter(nombre='Promotor').delete()
    print("Rol y Grupo 'Promotor' eliminados (si existían).")


class Migration(migrations.Migration):

    dependencies = [
        # Mantenemos las dependencias para asegurar el orden correcto general
        ('usuarios', '0002_crear_admin_por_defecto'),
        ('clientes', '0001_initial'), # Verifica nombre
        ('contratos', '0002_initial'), # Verifica nombre
        ('contenttypes', '0002_remove_content_type_name'),
        ('auth', '__latest__'),
    ]

    operations = [
        # Llama a la función SIMPLIFICADA
        migrations.RunPython(crear_rol_grupo_promotor_simple, reverse_code=eliminar_rol_grupo_promotor_simple),
    ]