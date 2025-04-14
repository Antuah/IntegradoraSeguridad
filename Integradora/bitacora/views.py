from rest_framework import viewsets, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Bitacora
from .serializers import BitacoraSerializer
import logging

logger = logging.getLogger(__name__)

class BitacoraViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Bitacora.objects.all().order_by('-fecha_hora')
    serializer_class = BitacoraSerializer
    permission_classes = [IsAuthenticated]  # Change from AllowAny to IsAuthenticated
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['usuario', 'accion', 'entidad', 'fecha_hora']
    search_fields = ['entidad', 'detalles']
    ordering_fields = ['fecha_hora', 'entidad', 'accion']
    
    def list(self, request, *args, **kwargs):
        try:
            logger.info("BitacoraViewSet.list: Processing request")
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in BitacoraViewSet.list: {str(e)}")
            # Re-raise the exception to let DRF handle it
            raise
    
    def retrieve(self, request, *args, **kwargs):
        try:
            logger.info("BitacoraViewSet.retrieve: Processing request")
            return super().retrieve(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in BitacoraViewSet.retrieve: {str(e)}")
            # Re-raise the exception to let DRF handle it
            raise


# Add this to your existing views.py file
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

# Endpoint seguro
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request): # NOSONAR
    """Simple health check endpoint to verify API is running"""
    return Response({"status": "ok", "message": "Bitacora API is running"})
