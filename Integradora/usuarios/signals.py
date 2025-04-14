# Opción A: Poner esto al final de usuarios/models.py
# Opción B: Crear usuarios/signals.py y poner esto ahí

# --- Asegúrate de tener estas importaciones ---
from django.conf import settings # Podríamos necesitarlo si CustomUser está en settings.AUTH_USER_MODEL
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
# --- Fin Importaciones ---

# --- ¡Nombres de App/Modelo CORRECTOS! (Verifica de nuevo) ---
APP_CLIENTES = 'clientes'
MODELO_CLIENTE = 'cliente'
APP_CONTRATOS = 'contratos'
MODELO_CONTRATO = 'contrato'
# --- ---

# Esta es la función que se ejecutará DESPUÉS de las migraciones
# El decorador @receiver es una forma de conectar la señal, la otra es usar .connect en apps.py
# Vamos a usar .connect en apps.py que es un poco más explícito para este caso.
# Por lo tanto, NO necesitas la línea @receiver(...) aquí si usas apps.py
# @receiver(post_migrate, sender=settings.AUTH_USER_MODEL._meta.app_config) # Ejemplo de decorador
def asignar_permisos_promotor(_sender, **_kwargs):
    """
    Asigna permisos de view/add(Cliente) y CRUD(Contrato) al grupo Promotor.
    Se ejecuta después de las migraciones vía señal post_migrate.
    """
    # Usamos los modelos directamente (no apps.get_model) porque esto corre en contexto normal
    from django.contrib.auth.models import Group, Permission
    from django.contrib.contenttypes.models import ContentType

    print("\n--- Señal post_migrate [usuarios]: Intentando asignar permisos a Promotor ---")
    try:
        print("Buscando Grupo 'Promotor'...")
        # Usamos get_or_create por si acaso, aunque la migración 0003 debería haberlo creado
        grupo_promotor, created = Group.objects.get_or_create(name='Promotor')
        if created: print(" Grupo 'Promotor' creado (inesperado aquí).")

        print(f"Buscando ContentType para {APP_CLIENTES}.{MODELO_CLIENTE}...")
        ct_cliente = ContentType.objects.get(app_label=APP_CLIENTES, model=MODELO_CLIENTE)
        print(f"Buscando ContentType para {APP_CONTRATOS}.{MODELO_CONTRATO}...")
        ct_contrato = ContentType.objects.get(app_label=APP_CONTRATOS, model=MODELO_CONTRATO)
        print("ContentTypes encontrados.")

        # Definir codenames de permisos necesarios
        permisos_necesarios_codenames = [
            f'view_{MODELO_CLIENTE}', f'add_{MODELO_CLIENTE}',
            f'view_{MODELO_CONTRATO}', f'add_{MODELO_CONTRATO}',
            f'change_{MODELO_CONTRATO}', f'delete_{MODELO_CONTRATO}',
        ]
        permisos_necesarios = []
        print("Buscando objetos Permission...")
        for codename in permisos_necesarios_codenames:
            ct = ct_cliente if codename.endswith(MODELO_CLIENTE) else ct_contrato
            try:
                perm = Permission.objects.get(content_type=ct, codename=codename)
                permisos_necesarios.append(perm)
                print(f"  -> Permiso '{codename}' encontrado.")
            except Permission.DoesNotExist:
                print(f"*** ADVERTENCIA en post_migrate: No se encontró el permiso '{codename}'.")

        # Asignar el conjunto completo de permisos
        if permisos_necesarios:
             print(f"\nEstableciendo permisos para el grupo '{grupo_promotor.name}'...")
             print(f"  Permisos a asignar: {[p.codename for p in permisos_necesarios]}")
             grupo_promotor.permissions.set(permisos_necesarios)
             print("¡Permisos del grupo Promotor asignados/actualizados vía post_migrate!")
        else:
             print("No se encontraron todos los permisos necesarios, no se asignó nada.")

    # Manejo de errores más específico
    except ContentType.DoesNotExist:
        print("*** ERROR en post_migrate: No se encontró ContentType necesario.")
        print("   Asegúrate que las apps '{APP_CLIENTES}' y '{APP_CONTRATOS}' estén en INSTALLED_APPS y migradas.")
    except Group.DoesNotExist:
         print("*** ERROR en post_migrate: No se encontró el Grupo 'Promotor'. La migración 0003 debe correr primero.")
    except Exception as e:
        print(f"*** ERROR inesperado en post_migrate asignando permisos: {e}")
        import traceback
        traceback.print_exc()

    print("--- Fin señal post_migrate [usuarios] ---")