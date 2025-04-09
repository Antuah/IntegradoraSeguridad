from django.db import migrations
import os # Para leer variables de entorno
import uuid # Para trabajar con UUIDs si es necesario para el Rol
from django.contrib.auth.hashers import make_password
import traceback # Para imprimir el traceback completo en caso de error



# --- Función MODIFICADA (Versión 4) para crear el usuario ---
def crear_usuario_admin(apps, schema_editor):
    """
    Crea un usuario administrador por defecto si no existe,
    hasheando la contraseña manualmente con make_password.
    """
    CustomUser = apps.get_model('usuarios', 'CustomUser')
    Rol = apps.get_model('usuarios', 'Rol')

    ADMIN_USERNAME = os.environ.get('DJANGO_ADMIN_USERNAME', 'admin@ejemplo.com')
    ADMIN_PASSWORD = os.environ.get('DJANGO_ADMIN_PASSWORD', 'admin12345') # ¡Contraseña en texto plano!
    ADMIN_NOMBRE = os.environ.get('DJANGO_ADMIN_NOMBRE', 'Admin')
    ADMIN_APELLIDO = os.environ.get('DJANGO_ADMIN_APELLIDO', 'Principal')

    print("--- Ejecutando migración para crear admin por defecto (v4) ---")
    try:
        # --- Paso 1: Obtener/Crear Rol 'Administrador' ---
        print("Buscando/Creando Rol 'Administrador'...")
        rol_admin, created = Rol.objects.get_or_create(
            nombre='Administrador',
            defaults={'descripcion': 'Rol con permisos de administrador'}
        )
        print(f"Rol 'Administrador' listo.")

        # --- Paso 2: Verificar si el usuario ya existe ---
        print(f"Verificando si existe el usuario '{ADMIN_USERNAME}'...")
        if not CustomUser.objects.filter(username=ADMIN_USERNAME).exists():
            # --- Paso 3: Intentar crear el usuario usando make_password ---
            print(f"Usuario '{ADMIN_USERNAME}' no existe. Intentando crear...")
            try:
                # Hashea la contraseña manualmente ANTES de crear la instancia
                hashed_password = make_password(ADMIN_PASSWORD)
                print("Contraseña hasheada.")

                # Creamos la instancia directamente con la contraseña YA HASHEADA
                user = CustomUser(
                    username=ADMIN_USERNAME,
                    password=hashed_password, # <-- Pasamos el hash
                    nombre=ADMIN_NOMBRE,
                    apellido=ADMIN_APELLIDO,
                    rol=rol_admin,
                    is_staff=True,
                    is_superuser=True,
                    is_active=True
                )
                # Guardamos el nuevo usuario en la base de datos
                user.save()
                print(f"\n¡ÉXITO! Usuario admin '{ADMIN_USERNAME}' creado (con make_password).")

            except Exception as e:
                print(f"\n*** ERROR AL CREAR USUARIO (make_password) ***: {e}")
                print("--- Traceback Completo del Error ---")
                traceback.print_exc()
                print("------------------------------------")
                raise e # Falla la migración si hay error
        else:
            # Si el usuario ya existe
            print(f"El usuario '{ADMIN_USERNAME}' ya existe en la base de datos.")

    except Exception as e:
        print(f"ERROR general antes de intentar crear usuario: {e}")
        traceback.print_exc()
        raise e # Falla la migración

    print("--- Fin migración crear admin (v4) ---")



# --- Función para revertir (opcional, pero buena práctica) ---
def eliminar_usuario_admin(apps, schema_editor):
    """
    Elimina el usuario administrador por defecto (si existe y si se desea revertir).
    PRECAUCIÓN: Usar con cuidado.
    """
    CustomUser = apps.get_model('usuarios', 'CustomUser')
    ADMIN_USERNAME = os.environ.get('DJANGO_ADMIN_USERNAME', 'admin@ejemplo.com')

    try:
        user = CustomUser.objects.get(username=ADMIN_USERNAME)
        # Solo elimina si es el admin por defecto y tal vez si es superusuario?
        # Podrías añadir más chequeos si quieres ser más seguro
        if user.is_superuser:
            print(f"Eliminando usuario administrador por defecto: {ADMIN_USERNAME}")
            user.delete()
        else:
             print(f"El usuario '{ADMIN_USERNAME}' existe pero no es superusuario. No se eliminó.")
    except CustomUser.DoesNotExist:
        print(f"El usuario administrador '{ADMIN_USERNAME}' no existe. No se eliminó nada.")


# --- Clase Migration ---
class Migration(migrations.Migration):

    dependencies = [
        # Asegúrate que esta migración dependa de la última migración
        # de tu app 'usuarios' donde se creó el modelo CustomUser y Rol.
        # Ejemplo: ('usuarios', '0001_initial'),
        ('usuarios', '0001_initial'),
    ]

    operations = [
        # Ejecuta la función para crear el admin
        migrations.RunPython(crear_usuario_admin, reverse_code=eliminar_usuario_admin),
        # reverse_code se ejecuta si haces migrate hacia atrás (opcional)
    ]