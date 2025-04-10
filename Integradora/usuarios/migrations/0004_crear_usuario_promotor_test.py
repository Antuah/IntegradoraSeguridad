# En usuarios/migrations/0004_crear_usuario_promotor_test.py

from django.db import migrations
import os
import traceback
from django.contrib.auth.hashers import make_password # Para hashear password

# --- Define los datos del promotor de prueba ---
PROMOTOR_USERNAME = os.environ.get('DJANGO_PROMOTOR_USERNAME', 'promotor@ejemplo.com')
PROMOTOR_PASSWORD = os.environ.get('DJANGO_PROMOTOR_PASSWORD', 'promotor123')
PROMOTOR_NOMBRE = os.environ.get('DJANGO_PROMOTOR_NOMBRE', 'Pedro')
PROMOTOR_APELLIDO = os.environ.get('DJANGO_PROMOTOR_APELLIDO', 'Promotor')
# --- ---

def crear_usuario_promotor(apps, schema_editor):
    """
    Crea un usuario de prueba con Rol y Grupo 'Promotor' si no existe.
    """
    CustomUser = apps.get_model('usuarios', 'CustomUser')
    Rol = apps.get_model('usuarios', 'Rol')
    Group = apps.get_model('auth', 'Group') # Grupo de Django

    print("\n--- Ejecutando migración para crear usuario Promotor ---")

    try:
        # --- Paso 1: Obtener el Rol y Grupo 'Promotor' (deben existir por migración anterior) ---
        print("Obteniendo Rol 'Promotor'...")
        rol_promotor = Rol.objects.get(nombre='Promotor')
        print("Obteniendo Grupo 'Promotor'...")
        grupo_promotor = Group.objects.get(name='Promotor')
        print("Rol y Grupo 'Promotor' obtenidos.")

        # --- Paso 2: Verificar si el usuario promotor ya existe ---
        print(f"Verificando si existe el usuario '{PROMOTOR_USERNAME}'...")
        if not CustomUser.objects.filter(username=PROMOTOR_USERNAME).exists():
            # --- Paso 3: Crear el usuario usando make_password ---
            print(f"Usuario '{PROMOTOR_USERNAME}' no existe. Intentando crear...")
            try:
                # Hashea la contraseña manualmente
                hashed_password = make_password(PROMOTOR_PASSWORD)
                print("Contraseña hasheada para promotor.")

                # Creamos la instancia directamente con la contraseña hasheada
                user = CustomUser(
                    username=PROMOTOR_USERNAME,
                    password=hashed_password,
                    nombre=PROMOTOR_NOMBRE,
                    apellido=PROMOTOR_APELLIDO,
                    rol=rol_promotor, # Asigna el Rol
                    is_staff=False,   # No es staff
                    is_superuser=False, # No es superusuario
                    is_active=True    # Activo por defecto
                )
                user.save() # Guarda el usuario para obtener un ID
                print(f"Usuario '{user.username}' creado con Rol '{user.rol.nombre}'.")

                # --- Paso 4: Añadir el usuario al Grupo 'Promotor' ---
                print(f"Añadiendo usuario '{user.username}' al grupo '{grupo_promotor.name}'...")
                # Añadimos al grupo después de guardar el usuario
                user.groups.add(grupo_promotor)
                print("Usuario añadido al grupo correctamente.")

                print(f"\n¡ÉXITO! Usuario Promotor '{PROMOTOR_USERNAME}' creado y añadido al grupo.")

            except Exception as e:
                print(f"\n*** ERROR AL CREAR USUARIO PROMOTOR ***: {e}")
                print("--- Traceback Completo del Error ---")
                traceback.print_exc()
                print("------------------------------------")
                raise e # Falla la migración
        else:
            # Si el usuario ya existe
            print(f"El usuario '{PROMOTOR_USERNAME}' ya existe.")
            # Opcional: Verificar/añadir al grupo si es necesario
            user = CustomUser.objects.get(username=PROMOTOR_USERNAME)
            if not user.groups.filter(name='Promotor').exists():
                 print(f"Añadiendo usuario existente '{user.username}' al grupo '{grupo_promotor.name}'...")
                 user.groups.add(grupo_promotor)
                 print("Usuario añadido al grupo.")
            else:
                 print(f"Usuario ya pertenece al grupo '{grupo_promotor.name}'.")

    except Rol.DoesNotExist:
        print("*** ERROR CRÍTICO: No se encontró el Rol 'Promotor'. Ejecuta la migración anterior primero (0003).")
        raise Exception("Rol 'Promotor' no encontrado.")
    except Group.DoesNotExist:
        print("*** ERROR CRÍTICO: No se encontró el Grupo 'Promotor'. Ejecuta la migración anterior primero (0003).")
        raise Exception("Grupo 'Promotor' no encontrado.")
    except Exception as e:
        print(f"ERROR general: {e}")
        traceback.print_exc()
        raise e

    print("--- Fin migración crear usuario Promotor ---")


# Función para eliminar el usuario promotor si se revierte la migración
def eliminar_usuario_promotor(apps, schema_editor):
    CustomUser = apps.get_model('usuarios', 'CustomUser')
    print(f"\nRevirtiendo migración: Eliminando usuario Promotor '{PROMOTOR_USERNAME}'...")
    try:
        user = CustomUser.objects.get(username=PROMOTOR_USERNAME)
        # Podríamos añadir un chequeo extra, ej. verificar que tenga el rol 'Promotor'
        print(f"Eliminando usuario '{user.username}'...")
        user.delete()
    except CustomUser.DoesNotExist:
        print(f"Usuario '{PROMOTOR_USERNAME}' no encontrado. No se eliminó nada.")


class Migration(migrations.Migration):

    dependencies = [
        # ¡Debe depender de la migración que crea el Rol y Grupo Promotor!
        ('usuarios', '0003_crear_rol_grupo_promotor'), # <-- Verifica este nombre
        # Podría necesitar también 'auth' y 'contenttypes' si no están implícitas
        ('auth', '__latest__'),
    ]

    operations = [
        migrations.RunPython(crear_usuario_promotor, reverse_code=eliminar_usuario_promotor),
    ]