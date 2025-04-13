from .models import Bitacora, TipoAccion
import logging

logger = logging.getLogger(__name__)

def log_activity(user, action, entity, entity_id=None, details=None, ip_address=None):
    """
    Utility function to log activities in the system
    
    Args:
        user: The user performing the action
        action: The type of action (from TipoAccion)
        entity: The entity being affected
        entity_id: The ID of the entity (optional)
        details: Additional details about the action (optional)
        ip_address: The IP address of the user (optional)
    """
    try:
        logger.info(f"Attempting to log activity: {action} on {entity} by {user}")
        
        # Convert details to string if it's a QueryDict or similar
        if details and hasattr(details, 'dict'):
            details = details.dict()
            
        # Remove sensitive information
        if isinstance(details, dict) and 'password' in details:
            details['password'] = '********'
        
        # Create the log entry
        _log_entry = Bitacora.objects.create(
            usuario=user,
            accion=action,
            entidad=entity,
            entidad_id=str(entity_id) if entity_id else None,
            detalles=details,
            direccion_ip=ip_address
        )
        
        logger.info(f"Successfully logged activity: {action} on {entity} by {user}")
        return True
    except Exception as e:
        # Log the error but don't raise it to prevent breaking the main functionality
        logger.error(f"Error logging activity: {str(e)}")
        # Print more details for debugging
        logger.error(f"Details: user={user}, action={action}, entity={entity}, entity_id={entity_id}")
        return False