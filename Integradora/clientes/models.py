import uuid
from django.db import models
from django.core.exceptions import ValidationError
class Cliente(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=255, null=False, blank=False)
    rfc = models.CharField(max_length=13, unique=True, null=False, blank=False)
    telefono = models.BigIntegerField(null=False, blank=False)

    def clean(self):
        if self.rfc and len(self.rfc) != 13:
            raise ValidationError("El RFC debe tener exactamente 13 caracteres sin espacios.")

        if self.telefono and (len(str(self.telefono)) != 10 or self.telefono < 0):
            raise ValidationError("El teléfono debe tener exactamente 10 dígitos.")

        if self.nombre and not self.nombre.strip().replace(" ", "").isalpha():
            raise ValidationError("El nombre solo debe contener letras.")

class Notificacion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    descripcion = models.TextField(null=False, blank=False)
    cliente = models.ForeignKey('clientes.Cliente', on_delete=models.CASCADE)
    fecha_envio = models.DateTimeField(auto_now_add=True)