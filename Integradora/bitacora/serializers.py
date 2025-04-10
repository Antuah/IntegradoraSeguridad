from rest_framework import serializers
from .models import Bitacora
from usuarios.serializers import CustomUserSerializer

class BitacoraSerializer(serializers.ModelSerializer):
    # Make usuario_details optional with a custom method field
    usuario_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Bitacora
        fields = ['id', 'usuario', 'usuario_details', 'accion', 'entidad', 
                  'entidad_id', 'detalles', 'direccion_ip', 'fecha_hora']
    
    def get_usuario_details(self, obj):
        """Safely get user details, handling None values"""
        if obj.usuario is None:
            return None
        
        try:
            return CustomUserSerializer(obj.usuario).data
        except Exception as e:
            # Return minimal info if serialization fails
            return {"username": str(obj.usuario), "error": str(e)}