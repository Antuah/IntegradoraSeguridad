from rest_framework import viewsets
from .models import Cliente
from .serializers import ClienteSerializer
from rest_framework import permissions  
from bitacora.mixins import BitacoraMixin

class ClienteViewSet(BitacoraMixin, viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [permissions.DjangoModelPermissions]
