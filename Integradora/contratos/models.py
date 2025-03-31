import uuid
from django.db import models

from paquetes.models import Paquete
from clientes.models import Cliente

class Contrato(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    activo = models.BooleanField(default=True)
    paquete = models.ForeignKey(Paquete, on_delete=models.CASCADE)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)