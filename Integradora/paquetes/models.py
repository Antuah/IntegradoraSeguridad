import uuid
from django.db import models
from canales.models import Canal
from django.core.exceptions import ValidationError

class Paquete(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    velocidad_internet = models.CharField(max_length=50, default='50 Mbps')
    incluye_telefonia = models.BooleanField(default=False)
    canales = models.ManyToManyField(Canal, related_name='paquetes')
    imagen_url = models.URLField(max_length=500, blank=True, null=True)

    def clean(self):
        # Validación contextual: El nombre no debe estar vacío ni contener solo espacios
        if not self.nombre.strip():
            raise ValidationError("El nombre del paquete no puede estar vacío o contener solo espacios.")
        
        # Validación contextual: La descripción debe tener al menos 10 caracteres
        if len(self.descripcion.strip()) < 10:
            raise ValidationError("La descripción del paquete debe tener al menos 10 caracteres.")
        
        # Validación contextual: El precio debe ser mayor a 0
        if self.precio <= 0:
            raise ValidationError("El precio del paquete debe ser mayor a 0.")
        
        # Validación contextual: La velocidad de internet debe tener un formato válido (e.g., '50 Mbps')
        if not self.velocidad_internet.strip().endswith('Mbps'):
            raise ValidationError("La velocidad de internet debe especificarse en Mbps (por ejemplo, '50 Mbps').")
        
        # Validación contextual: Si se proporciona una URL, debe ser válida
        if self.imagen_url and not self.imagen_url.startswith('https://'):
            raise ValidationError("La URL de la imagen debe comenzar con 'https://'.")
        # Validación contextual: Debe incluir al menos un canal
        if not self.canales.exists():
            raise ValidationError("El paquete debe incluir al menos un canal.")

    def __str__(self):
        return self.nombre