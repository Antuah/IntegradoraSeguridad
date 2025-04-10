from rest_framework.response import Response
from .models import TipoAccion
from .utils import log_activity
import logging

logger = logging.getLogger(__name__)

class BitacoraMixin:
    """
    Mixin para registrar actividades CRUD en la bitácora
    """
    
    def get_entity_name(self):
        """Obtiene el nombre de la entidad basado en el modelo del ViewSet"""
        return self.queryset.model.__name__
    
    def create(self, request, *args, **kwargs):
        """Registra la creación de un objeto"""
        logger.info(f"BitacoraMixin.create: Processing request for {self.get_entity_name()} by {request.user}")
        
        try:
            # First call the original create method
            response = super().create(request, *args, **kwargs)
            
            # Only log if the request was successful
            if response.status_code >= 200 and response.status_code < 300:
                # Get the ID from the response data
                entity_id = response.data.get('id')
                
                # Get request data safely
                request_data = request.data.copy() if hasattr(request.data, 'copy') else request.data
                
                logger.info(f"BitacoraMixin.create: Logging activity for {self.get_entity_name()} with ID {entity_id}")
                
                # Log the activity
                log_activity(
                    user=request.user,
                    action=TipoAccion.CREACION,
                    entity=self.get_entity_name(),
                    entity_id=entity_id,
                    details=request_data,
                    ip_address=request.META.get('REMOTE_ADDR')
                )
            
            return response
        except Exception as e:
            # Log the error but don't interfere with the main functionality
            logger.error(f"Error in BitacoraMixin.create: {str(e)}")
            # Still return the original response
            return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """Registra la actualización de un objeto"""
        try:
            # First call the original update method
            response = super().update(request, *args, **kwargs)
            
            # Only log if the request was successful
            if response.status_code >= 200 and response.status_code < 300:
                # Get request data safely
                request_data = request.data.copy() if hasattr(request.data, 'copy') else request.data
                
                # Log the activity
                log_activity(
                    user=request.user,
                    action=TipoAccion.EDICION,
                    entity=self.get_entity_name(),
                    entity_id=kwargs.get('pk'),
                    details=request_data,
                    ip_address=request.META.get('REMOTE_ADDR')
                )
            
            return response
        except Exception as e:
            # Log the error but don't interfere with the main functionality
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in BitacoraMixin.update: {str(e)}")
            # Still return the original response
            return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Registra la eliminación de un objeto"""
        try:
            # Get the ID before deleting the object
            entity_id = kwargs.get('pk')
            
            # First call the original destroy method
            response = super().destroy(request, *args, **kwargs)
            
            # Only log if the request was successful
            if response.status_code >= 200 and response.status_code < 300:
                # Log the activity
                log_activity(
                    user=request.user,
                    action=TipoAccion.ELIMINACION,
                    entity=self.get_entity_name(),
                    entity_id=entity_id,
                    details={'id': entity_id},
                    ip_address=request.META.get('REMOTE_ADDR')
                )
            
            return response
        except Exception as e:
            # Log the error but don't interfere with the main functionality
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in BitacoraMixin.destroy: {str(e)}")
            # Still return the original response
            return super().destroy(request, *args, **kwargs)