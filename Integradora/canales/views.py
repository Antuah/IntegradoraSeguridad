from rest_framework import viewsets
from .models import Categoria, Canal
from .serializers import CategoriaSerializer, CanalSerializer
from bitacora.mixins import BitacoraMixin

class CategoriaViewSet(BitacoraMixin, viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class CanalViewSet(BitacoraMixin, viewsets.ModelViewSet):
    queryset = Canal.objects.all()
    serializer_class = CanalSerializer
