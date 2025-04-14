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
from django.core.cache import cache
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

from django.core.cache import cache
from datetime import datetime, timedelta

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        
        # Check if user is currently blocked
        cache_key = f"login_blocked_{username}"
        if cache.get(cache_key):
            return Response(
                {'detail': 'Tu cuenta está temporalmente bloqueada. Por favor, intenta más tarde.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        # Get failed attempts
        attempts_key = f"login_attempts_{username}"
        failed_attempts = cache.get(attempts_key, 0)

        try:
            response = super().post(request, *args, **kwargs)
            # Reset attempts on successful login
            if failed_attempts > 0:
                cache.delete(attempts_key)
            return response
        except Exception as e:
            # Increment failed attempts
            failed_attempts += 1
            
            if failed_attempts >= 5:  # Block after 5 failed attempts
                # Block for 15 minutes
                cache.set(cache_key, True, 900)  # 900 seconds = 15 minutes
                cache.delete(attempts_key)  # Reset attempts counter
                return Response(
                    {'detail': 'Demasiados intentos fallidos. Tu cuenta ha sido bloqueada por 15 minutos.'},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            else:
                # Store failed attempts (expire after 1 hour)
                cache.set(attempts_key, failed_attempts, 3600)
                remaining_attempts = 5 - failed_attempts
                return Response(
                    {
                        'detail': f'Credenciales inválidas. Te quedan {remaining_attempts} intentos antes del bloqueo.',
                        'remaining_attempts': remaining_attempts
                    },
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
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
            
            # Rate limiting check
            cache_key = f"password_reset_{username}"
            reset_attempts = cache.get(cache_key, 0)
            
            # Limit to 3 attempts per hour
            if reset_attempts >= 3:
                return Response(
                    {'detail': 'Has excedido el límite de intentos. Por favor, espera 1 hora.'},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

            # Increment attempt counter
            cache.set(cache_key, reset_attempts + 1, 3600)  # 3600 seconds = 1 hour
            
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
