from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from bitacora.models import TipoAccion
from bitacora.utils import log_activity
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
# Add these imports for password reset functionality
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from .serializers import (
    CustomUserSerializer, 
    CustomTokenObtainPairSerializer,
    PasswordResetSerializer,
    PasswordResetConfirmSerializer
)
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
            user = get_user_model()
            user.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password1']
            )
            return Response({'message': 'Usuario creado correctamente'}, status=status.HTTP_201_CREATED)
        else:
            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

# Endpoint seguro
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request): # NOSONAR
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


class PasswordResetView(APIView):
    """
    API endpoint for requesting a password reset email
    """
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            
            # Check if the user exists
            user_exists = CustomUser.objects.filter(username=username).exists()
            
            if not user_exists:
                # Return error for non-existent user
                return Response(
                    {'detail': 'No existe una cuenta con este correo electrónico.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # User exists, proceed with password reset
            user = CustomUser.objects.get(username=username)
            
            # Generate token and uid
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Build reset URL (frontend URL)
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
            
            # Create email content
            subject = 'Restablecimiento de contraseña SIGIPT'
            message = render_to_string('password_reset_email.html', {
                'user': user,
                'reset_url': reset_url,
                'site_name': 'SIGIPT',
            })
            
            # Send email
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [user.username],  # Assuming username is email
                html_message=message,
                fail_silently=False,
            )
            
            # Log the activity
            log_activity(
                user=user,
                action=TipoAccion.CONSULTA,
                entity='Usuario',
                entity_id=str(user.id),
                details={'message': 'Solicitud de restablecimiento de contraseña'},
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response(
                {'detail': 'Se ha enviado un correo con instrucciones para restablecer tu contraseña.'},
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetDoneView(APIView):
    """
    API endpoint for confirming password reset email was sent
    """
    def get(self, request):
        return Response({'detail': 'Se ha enviado un correo con instrucciones para restablecer tu contraseña.'})

class PasswordResetConfirmView(APIView):
    """
    API endpoint for confirming and setting a new password
    """
    def post(self, request, uidb64, token):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Decode the user id
                uid = force_str(urlsafe_base64_decode(uidb64))
                user = CustomUser.objects.get(pk=uid)
                
                # Check if the token is valid
                if default_token_generator.check_token(user, token):
                    # Set the new password
                    user.set_password(serializer.validated_data['new_password'])
                    user.save()
                    
                    # Log the activity
                    log_activity(
                        user=user,
                        action=TipoAccion.EDICION,
                        entity='Usuario',
                        entity_id=str(user.id),
                        details={'message': 'Contraseña restablecida exitosamente'},
                        ip_address=request.META.get('REMOTE_ADDR')
                    )
                    
                    return Response(
                        {'detail': 'Tu contraseña ha sido restablecida exitosamente.'},
                        status=status.HTTP_200_OK
                    )
                else:
                    return Response(
                        {'detail': 'El enlace de restablecimiento es inválido o ha expirado.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
                return Response(
                    {'detail': 'El enlace de restablecimiento es inválido o ha expirado.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetCompleteView(APIView):
    """
    API endpoint for confirming password was reset successfully
    """
    def get(self, request):
        return Response({'detail': 'Tu contraseña ha sido restablecida exitosamente.'})
