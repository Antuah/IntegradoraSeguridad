import json
from .models import Bitacora, TipoAccion
import re
import logging

logger = logging.getLogger(__name__)

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class BitacoraMiddleware:
    def __init__(self, get_response):  # NOSONAR
        self.get_response = get_response
        # Patrones para identificar operaciones CRUD en las URLs
        self.url_patterns = {
            r'/api/canales/canales/(?P<id>[^/]+)/$': 'Canal',
            r'/api/canales/categorias/(?P<id>[^/]+)/$': 'Categoria',
            r'/api/paquetes/paquetes/(?P<id>[^/]+)/$': 'Paquete',
            r'/api/clientes/clientes/(?P<id>[^/]+)/$': 'Cliente',
            r'/api/contratos/contratos/(?P<id>[^/]+)/$': 'Contrato',
            r'/api/usuarios/usuarios/(?P<id>[^/]+)/$': 'Usuario',
            # URLs para listas (creación)
            r'/api/canales/canales/$': 'Canal',
            r'/api/canales/categorias/$': 'Categoria',
            r'/api/paquetes/paquetes/$': 'Paquete',
            r'/api/clientes/clientes/$': 'Cliente',
            r'/api/contratos/contratos/$': 'Contrato',
            r'/api/usuarios/usuarios/$': 'Usuario',
        }
        
        # Login/logout endpoints
        self.auth_endpoints = {
            '/usuarios/token/': 'login',
            '/api/usuarios/token/': 'login',
            '/usuarios/logout/': 'logout',
            '/api/usuarios/logout/': 'logout',
        }

        def __call__(self, request): # NOSONAR
            response = self.get_response(request)

            endpoint_type = self.auth_endpoints.get(request.path)
            is_login = endpoint_type == 'login' and request.method == 'POST'

            if is_login and 200 <= response.status_code < 300:
                username = 'unknown'
                try:
                    if hasattr(request, 'body'):
                        body_data = json.loads(request.body.decode('utf-8'))
                        username = body_data.get('username', 'unknown')
                except Exception:
                    pass
                
                user = None
                if hasattr(response, 'data') and 'user' in response.data:
                    from usuarios.models import CustomUser
                    try:
                        user = CustomUser.objects.get(username=response.data['user']['username'])
                    except Exception:
                        pass
                    
                details = {'username': username, 'message': 'Inicio de sesión exitoso'}
                try:
                    Bitacora.objects.create(
                        usuario=user,
                        accion=TipoAccion.INICIO_SESION,
                        entidad='Usuario',
                        detalles=details,
                        direccion_ip=get_client_ip(request)
                    )
                    logger.info(f"Login registered for user: {username}")
                except Exception as e:
                    logger.error(f"Error registering login: {str(e)}")

            elif getattr(request, 'user', None) and request.user.is_authenticated:
                if not request.path.startswith('/static/') and not request.path.startswith('/admin/'):
                    self.log_request(request, response)

            return response
    
    def log_request(self, request, response):
        # Skip OPTIONS requests
        if request.method == 'OPTIONS':
            return
            
        # Determine action type based on HTTP method
        action_map = {
            'GET': TipoAccion.CONSULTA,
            'POST': TipoAccion.CREACION,
            'PUT': TipoAccion.EDICION,
            'PATCH': TipoAccion.EDICION,
            'DELETE': TipoAccion.ELIMINACION,
        }
        
        # Manejar login/logout específicamente
        if request.path == '/usuarios/token/' and request.method == 'POST':
            # Si la respuesta es exitosa (200), es un inicio de sesión exitoso
            if 200 <= response.status_code < 300:
                action = TipoAccion.INICIO_SESION
                entity = 'Usuario'
                self._create_log_entry(request, action, entity)
            return
            
        # Para otras rutas, determinar la entidad y acción
        action = action_map.get(request.method, TipoAccion.CONSULTA)
        entity, entity_id = self._extract_entity_from_url(request.path)
        
        if entity:
            # Crear entrada de log
            self._create_log_entry(request, action, entity, entity_id)
    
    def _extract_entity_from_url(self, path):
        """Extrae la entidad y su ID de la URL"""
        for pattern, entity in self.url_patterns.items():
            match = re.match(pattern, path)
            if match:
                entity_id = match.groupdict().get('id')
                return entity, entity_id
        return None, None
    
    def _create_log_entry(self, request, action, entity, entity_id=None):
        """Crea una entrada en la bitácora"""
        try:
            # Extraer detalles del cuerpo de la solicitud para POST/PUT/PATCH
            details = None
            if request.method in ['POST', 'PUT', 'PATCH'] and hasattr(request, 'body'):
                try:
                    # Intentar parsear el cuerpo como JSON
                    details = json.loads(request.body.decode('utf-8'))
                    # Eliminar campos sensibles como contraseñas
                    for campo in list(details.keys()):
                        if 'pass' in campo.lower():
                            details[campo] = '[REDACTED]'
                except Exception as e:
                    # Si no se puede parsear, registrar el error y usar un mensaje genérico
                    details = {'raw': 'No se pudo parsear el cuerpo de la solicitud', 'error': str(e)}
            
            # Crear la entrada en la bitácora
            Bitacora.objects.create(
                usuario=request.user,
                accion=action,
                entidad=entity,
                entidad_id=entity_id,
                detalles=details,
                direccion_ip=get_client_ip(request)
            )
            logger.info(f"Actividad registrada: {action} en {entity} por {request.user.username}")
        except Exception as e:
            logger.error(f"Error al registrar actividad: {str(e)}")