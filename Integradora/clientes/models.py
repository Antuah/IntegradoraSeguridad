import uuid
from django.db import models

class Cliente(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=255)
    direccion = models.TextField()
    rfc = models.CharField(max_length=13, unique=True)
    telefono = models.BigIntegerField()

class Notificacion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    descripcion = models.TextField()
    cliente = models.ForeignKey('clientes.Cliente', on_delete=models.CASCADE)
    fecha_envio = models.DateTimeField(auto_now_add=True)