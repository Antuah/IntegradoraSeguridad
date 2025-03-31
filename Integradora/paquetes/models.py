import uuid
from django.db import models

from canales.models import Canal

class Paquete(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    canales = models.ManyToManyField(Canal, related_name='paquetes')