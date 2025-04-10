from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from bitacora.models import TipoAccion
from bitacora.utils import log_activity
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import CustomUserSerializer, CustomTokenObtainPairSerializer
from .models import CustomUser
from .forms import CustomUserCreationForm
from rest_framework_simplejwt.views import TokenObtainPairView

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'DELETE']:
            return [IsAuthenticated()]
        return [AllowAny()]

# Add this import at the top of the file
from bitacora.models import TipoAccion
from bitacora.utils import log_activity

# Find your token view (might be using SimpleJWT's TokenObtainPairView)
# Add this code after the token is generated but before returning the response

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        # If login was successful, log it
        if response.status_code == 200:
            try:
                # Get username from request
                username = request.data.get('username', 'unknown')
                
                # Try to get the user
                from usuarios.models import CustomUser
                try:
                    user = CustomUser.objects.get(username=username)
                except CustomUser.DoesNotExist:
                    user = None
                
                # Log the login activity
                log_activity(
                    user=user,
                    action=TipoAccion.INICIO_SESION,
                    entity='Usuario',
                    details={'message': 'Inicio de sesión exitoso via token'},
                    ip_address=request.META.get('REMOTE_ADDR')
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error logging login activity: {str(e)}")
        
        return response
    serializer_class = CustomTokenObtainPairSerializer


class CustomUserFormAPI(APIView):
    def get(self, request):
        form = CustomUserCreationForm()
        fields = {
            field:{
                'label': form.fields[field].label,
                'widget': form.fields[field].widget,
                'help_text': form.fields[field].help_text
            }
            for field in form.fields
        }
        return Response(fields, status=status.HTTP_200_OK)
    
    def post(self, request):
        form = CustomUserCreationForm(request.data)
        if form.is_valid():
            user_data = form.cleaned_data
            User = get_user_model()
            User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password1']
            )
            return Response({'message': 'Usuario creado correctamente'}, status=status.HTTP_201_CREATED)
        else:
            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Endpoint para registrar el cierre de sesión"""
    # Registrar el cierre de sesión en la bitácora
    log_activity(
        user=request.user,
        action=TipoAccion.CIERRE_SESION,
        entity='Usuario',
        details={'message': 'Cierre de sesión exitoso'},
        ip_address=request.META.get('REMOTE_ADDR')
    )
    
    return Response({"detail": "Cierre de sesión exitoso"}, status=status.HTTP_200_OK)
