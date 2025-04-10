from django.db import models
import uuid
from usuarios.models import CustomUser

class TipoAccion(models.TextChoices):
    INICIO_SESION = 'INICIO_SESION', 'Inicio de Sesión'
    CIERRE_SESION = 'CIERRE_SESION', 'Cierre de Sesión'
    CREACION = 'CREACION', 'Creación'
    EDICION = 'EDICION', 'Edición'
    ELIMINACION = 'ELIMINACION', 'Eliminación'
    CONSULTA = 'CONSULTA', 'Consulta'

class Bitacora(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='acciones')
    accion = models.CharField(max_length=20, choices=TipoAccion.choices)
    entidad = models.CharField(max_length=50)  # Nombre de la entidad (Canal, Paquete, etc.)
    entidad_id = models.CharField(max_length=50, null=True, blank=True)  # ID de la entidad afectada
    detalles = models.JSONField(null=True, blank=True)  # Detalles adicionales en formato JSON
    direccion_ip = models.GenericIPAddressField(null=True, blank=True)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-fecha_hora']
        verbose_name = 'Registro de Actividad'
        verbose_name_plural = 'Registros de Actividad'
    
    def __str__(self):
        return f"{self.get_accion_display()} de {self.entidad} por {self.usuario} - {self.fecha_hora}"
