# En usuarios/migrations/0003_crear_rol_grupo_promotor.py

from django.db import migrations

# --- Nombres de App y Modelo confirmados ---
APP_CLIENTES = 'clientes'
MODELO_CLIENTE = 'cliente' # Nombre en minúsculas para ContentType/codename

APP_CONTRATOS = 'contratos'
MODELO_CONTRATO = 'contrato' # Nombre en minúsculas para ContentType/codename
# --- Fin Nombres ---


def crear_rol_grupo_promotor(apps, schema_editor):
    """
    Crea el Rol 'Promotor', el Grupo 'Promotor' y asigna permisos de 'view'.
    """
    # Modelos necesarios
    Rol = apps.get_model('usuarios', 'Rol')
    Group = apps.get_model('auth', 'Group')
    Permission = apps.get_model('auth', 'Permission')
    ContentType = apps.get_model('contenttypes', 'ContentType')

    print("\n--- Ejecutando migración para crear Rol/Grupo Promotor ---")

    # 1. Crear/Obtener Rol 'Promotor'
    print("Buscando/Creando Rol 'Promotor'...")
    rol_promotor, created_rol = Rol.objects.get_or_create(
        nombre='Promotor',
        defaults={'descripcion': 'Usuario con permisos de consulta para Clientes y Contratos.'}
    )
    if created_rol:
        print("Rol 'Promotor' creado.")
    else:
        print("Rol 'Promotor' ya existía.")

    # 2. Crear/Obtener Grupo 'Promotor'
    print("Buscando/Creando Grupo 'Promotor'...")
    grupo_promotor, created_group = Group.objects.get_or_create(name='Promotor')
    if created_group:
        print("Grupo 'Promotor' creado.")
    else:
        print("Grupo 'Promotor' ya existía.")

    # 3. Obtener Permisos de 'view' y asignarlos al grupo
    try:
        # Obtener ContentType para los modelos Cliente y Contrato
        ct_cliente = ContentType.objects.get(app_label=APP_CLIENTES, model=MODELO_CLIENTE)
        ct_contrato = ContentType.objects.get(app_label=APP_CONTRATOS, model=MODELO_CONTRATO)

        # Obtener los permisos específicos de 'view'
        # El codename es 'view_<nombre_modelo_minusculas>'
        perm_view_cliente = Permission.objects.get(content_type=ct_cliente, codename=f'view_{MODELO_CLIENTE}')
        perm_view_contrato = Permission.objects.get(content_type=ct_contrato, codename=f'view_{MODELO_CONTRATO}')

        print(f"Asignando permiso '{perm_view_cliente.codename}' al grupo 'Promotor'...")
        grupo_promotor.permissions.add(perm_view_cliente)
        print(f"Asignando permiso '{perm_view_contrato.codename}' al grupo 'Promotor'...")
        grupo_promotor.permissions.add(perm_view_contrato)
        print("Permisos asignados correctamente.")

    except ContentType.DoesNotExist:
        print(f"\n*** ERROR: No se encontró ContentType para '{APP_CLIENTES}.{MODELO_CLIENTE}' o '{APP_CONTRATOS}.{MODELO_CONTRATO}'.")
        print("   Asegúrate de que las migraciones de 'clientes' y 'contratos' se hayan ejecutado ANTES que esta.")
        raise Exception("ContentType no encontrado. Verifica las dependencias de la migración.")
    except Permission.DoesNotExist:
        print(f"\n*** ERROR: No se encontró el permiso 'view_{MODELO_CLIENTE}' o 'view_{MODELO_CONTRATO}'.")
        print("   Asegúrate de que los modelos Cliente/Contrato existan y sus migraciones iniciales se hayan ejecutado.")
        raise Exception("Permiso 'view' no encontrado. Verifica las dependencias de la migración.")
    except Exception as e:
         print(f"\n*** ERROR inesperado asignando permisos: {e}")
         raise e

    print("--- Fin migración Rol/Grupo Promotor ---")


# Función de reversión (opcional)
def eliminar_rol_grupo_promotor(apps, schema_editor):
    Rol = apps.get_model('usuarios', 'Rol')
    Group = apps.get_model('auth', 'Group')
    print("\nRevirtiendo migración: Eliminando Rol y Grupo 'Promotor'...")
    try:
        grupo = Group.objects.get(name='Promotor')
        print(f"Eliminando Grupo '{grupo.name}'...")
        grupo.delete()
    except Group.DoesNotExist:
        print("Grupo 'Promotor' no encontrado.")
    try:
        rol = Rol.objects.get(nombre='Promotor')
        print(f"Eliminando Rol '{rol.nombre}'...")
        # Si tienes usuarios con este rol y on_delete=PROTECT, esto fallará al revertir.
        rol.delete()
    except Rol.DoesNotExist:
        print("Rol 'Promotor' no encontrado.")


class Migration(migrations.Migration):

    dependencies = [
        # --- ¡¡VERIFICA Y CORRIGE ESTOS NOMBRES!! ---
        ('usuarios', '0002_crear_admin_por_defecto'), # La migración anterior de usuarios
        ('clientes', '0001_initial'), # Reemplaza '0001_initial' por el nombre REAL de la última migración de la app 'clientes'
        ('contratos', '0002_initial'), # Reemplaza '0001_initial' por el nombre REAL de la última migración de la app 'contratos'
        # --- FIN VERIFICACIÓN ---
        # Dependencias automáticas que Django podría necesitar:
        ('contenttypes', '__latest__'),
        ('auth', '__latest__'),
    ]

    operations = [
        migrations.RunPython(crear_rol_grupo_promotor, reverse_code=eliminar_rol_grupo_promotor),
    ]