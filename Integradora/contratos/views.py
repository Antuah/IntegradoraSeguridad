from rest_framework import viewsets
from rest_framework import permissions 
from .models import Contrato
from .serializers import ContratoSerializer
from bitacora.mixins import BitacoraMixin

class ContratoViewSet(BitacoraMixin, viewsets.ModelViewSet):
    queryset = Contrato.objects.all()
    serializer_class = ContratoSerializer
    permission_classes = [permissions.DjangoModelPermissions]
