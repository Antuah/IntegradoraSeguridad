from rest_framework import viewsets
from .models import Paquete
from .serializers import PaqueteSerializer
from bitacora.mixins import BitacoraMixin

class PaqueteViewSet(BitacoraMixin, viewsets.ModelViewSet):
    queryset = Paquete.objects.all()
    serializer_class = PaqueteSerializer
