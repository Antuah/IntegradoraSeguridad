import uuid
from django.db import models
from django.core.exceptions import ValidationError

class Categoria(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=255, unique=True)

    def clean(self):
        if not self.nombre.isalnum():
            raise ValidationError("El nombre de la categoría solo puede contener caracteres alfanuméricos.")

    def __str__(self):
        return self.nombre

class Canal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=255)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    imagen_url = models.URLField(max_length=500, blank=True, null=True)
    
    def clean(self):
        # Validación contextual: El nombre no debe ser vacío ni contener solo espacios
        if not self.nombre.strip():
            raise ValidationError("El nombre del canal no puede estar vacío o contener solo espacios.")
        # Validación contextual: Si se proporciona una URL, debe ser válida
        if self.imagen_url and not self.imagen_url.startswith('https://'):
            raise ValidationError("La URL de la imagen debe comenzar con 'https://'.")
        # Validación contextual: No permitir duplicados en la misma categoría
        if Canal.objects.filter(nombre=self.nombre, categoria=self.categoria).exclude(id=self.id).exists():
            raise ValidationError("Ya existe un canal con este nombre en la misma categoría.")

    def __str__(self):
        return self.nombre    