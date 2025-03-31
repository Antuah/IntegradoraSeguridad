from rest_framework import serializers
from .models import Paquete
from canales.serializers import CanalSerializer

class PaqueteSerializer(serializers.ModelSerializer):
    canales = CanalSerializer(many=True, read_only=True)
    canales_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Paquete
        fields = ['id', 'nombre', 'descripcion', 'precio', 'velocidad_internet', 
                 'incluye_telefonia', 'canales', 'canales_ids', 'imagen_url']
        read_only_fields = ['id']

    def create(self, validated_data):
        canales_ids = validated_data.pop('canales_ids', [])
        paquete = Paquete.objects.create(**validated_data)
        paquete.canales.set(canales_ids)
        return paquete

    def update(self, instance, validated_data):
        canales_ids = validated_data.pop('canales_ids', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        instance.canales.set(canales_ids)
        return instance