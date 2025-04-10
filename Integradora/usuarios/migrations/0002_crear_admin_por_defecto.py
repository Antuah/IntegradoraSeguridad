from django.db import migrations
import os # Para leer variables de entorno
import uuid # Para trabajar con UUIDs si es necesario para el Rol

# --- Función para crear el usuario ---
# --- Función MODIFICADA para crear el usuario ---
def crear_usuario_admin(apps, schema_editor):
    """
    Crea un usuario administrador por defecto si no existe.
    """
    CustomUser = apps.get_model('usuarios', 'CustomUser')
    Rol = apps.get_model('usuarios', 'Rol')
    # --- Obtén el manager explícitamente ---
    # Usualmente se llama 'objects', pero usa el nombre correcto si lo cambiaste en tu modelo
    UserManager = CustomUser.objects

    ADMIN_USERNAME = os.environ.get('DJANGO_ADMIN_USERNAME', 'admin@ejemplo.com')
    ADMIN_PASSWORD = os.environ.get('DJANGO_ADMIN_PASSWORD', 'admin12345')
    ADMIN_NOMBRE = os.environ.get('DJANGO_ADMIN_NOMBRE', 'Admin')
    ADMIN_APELLIDO = os.environ.get('DJANGO_ADMIN_APELLIDO', 'Principal')

    # La creación/obtención del rol 'Administrador' está bien como estaba
    rol_admin, created = Rol.objects.get_or_create(
        nombre='Administrador',
        defaults={'descripcion': 'Rol con permisos de administrador'}
    )
    if created:
        print(f"Rol 'Administrador' creado con ID: {rol_admin.id}")

    # --- Usa el UserManager obtenido para filtrar y crear ---
    if not UserManager.filter(username=ADMIN_USERNAME).exists():
        print(f"Creando usuario administrador por defecto: {ADMIN_USERNAME}")
        try:
            # --- Llama a create_superuser DESDE el UserManager obtenido ---
            # Tu método create_superuser ya busca/crea el rol Admin,
            # y debería pasar nombre/apellido a create_user vía **extra_fields
            UserManager.create_superuser(
                username=ADMIN_USERNAME,
                password=ADMIN_PASSWORD,
                # Pasamos nombre y apellido directamente, create_superuser los recibe en **extra_fields
                nombre=ADMIN_NOMBRE,
                apellido=ADMIN_APELLIDO
            )
            print("Usuario administrador creado exitosamente.")
        except Exception as e:
             # Muestra el error específico que ocurra dentro de create_superuser
             print(f"\nERROR al crear superusuario: {e}")
             print("Verifica que tu método create_superuser en el manager funcione correctamente.")

    else:
        print(f"El usuario administrador '{ADMIN_USERNAME}' ya existe. No se creó uno nuevo.")

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