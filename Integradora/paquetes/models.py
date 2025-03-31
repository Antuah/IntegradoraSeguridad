import uuid
from django.db import models
from canales.models import Canal

class Paquete(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    velocidad_internet = models.CharField(max_length=50, default='50 Mbps')
    incluye_telefonia = models.BooleanField(default=False)
    canales = models.ManyToManyField(Canal, related_name='paquetes')
    imagen_url = models.URLField(max_length=500, blank=True, null=True)