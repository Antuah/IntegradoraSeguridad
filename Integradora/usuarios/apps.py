# usuarios/apps.py
from django.apps import AppConfig
from django.db.models.signals import post_migrate # Importa la señal

class UsuariosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'usuarios' # Nombre de tu app

    def ready(self):
        """
        Este método se ejecuta cuando la app está lista.
        Aquí conectamos la señal.
        """
        # Importa la función manejadora AQUI DENTRO para evitar importaciones circulares
        from .signals import asignar_permisos_promotor # O from .signals import ... si lo pusiste en signals.py

        print("UsuariosConfig.ready(): Conectando señal post_migrate...")
        # Conecta la función 'asignar_permisos_promotor' a la señal 'post_migrate'
        # sender=self asegura que solo se dispare después de las migraciones de ESTA app ('usuarios')
        post_migrate.connect(asignar_permisos_promotor, sender=self)
        print("Señal post_migrate conectada.")