from rest_framework import serializers
from .models import Contrato
from clientes.serializers import ClienteSerializer
from paquetes.serializers import PaqueteSerializer

class ContratoSerializer(serializers.ModelSerializer):
    cliente_details = ClienteSerializer(source='cliente', read_only=True)
    paquete_details = PaqueteSerializer(source='paquete', read_only=True)

    class Meta:
        model = Contrato
        fields = ['id', 'fecha_inicio', 'fecha_fin', 'activo', 'paquete', 'cliente', 'cliente_details', 'paquete_details']
        read_only_fields = ['id']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['cliente'] = representation.pop('cliente_details')
        representation['paquete'] = representation.pop('paquete_details')
        return representation