from rest_framework import serializers
from .models import CustomUser, Rol;
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# --- MODIFICA ESTA CLASE ---
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        # 1. Obtiene el token estándar
        token = super().get_token(user)

        # --- AÑADIR ESTAS LÍNEAS ---
        # 2. Añade campos personalizados al payload del token
        token['username'] = user.username # Este ya lo tenías
        try:
            # Añadimos el nombre del Rol del usuario
            token['rol'] = user.rol.nombre
        except AttributeError:
             # En caso de que el usuario no tenga un rol asignado correctamente
            token['rol'] = None
        # Podrías añadir otros datos aquí si los necesitas rápido en frontend
        # token['user_id'] = user.id
        # token['nombre_completo'] = user.nombre + ' ' + user.apellido
        # --- FIN LÍNEAS A AÑADIR ---

        # 3. Devuelve el token modificado
        return token
# --- FIN MODIFICACIÓN ---

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password']


# Add these serializers if they're missing
from rest_framework import serializers

class PasswordResetSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)

class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True, min_length=8, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        """
        Check that the two password entries match
        """
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return data