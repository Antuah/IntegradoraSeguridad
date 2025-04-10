import uuid
from django.db import models
from django.core.exceptions import ValidationError
from paquetes.models import Paquete
from clientes.models import Cliente


class Contrato(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fecha_inicio = models.DateField(null=False, blank=False)
    fecha_fin = models.DateField(null=False, blank=False)
    activo = models.BooleanField(default=True)
    paquete = models.ForeignKey(Paquete, on_delete=models.CASCADE, null=False, blank=False)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, null=False, blank=False)

    def clean(self):
        if not self.fecha_inicio or not self.fecha_fin:
            raise ValidationError("Las fechas de inicio y fin son obligatorias.")

        diferencia = self.fecha_fin - self.fecha_inicio
        if diferencia.days != 365 and diferencia.days != 366:
            raise ValidationError("El contrato debe tener una duración de 1 año.")