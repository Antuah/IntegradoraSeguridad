from django.contrib import admin
from django.urls import path, include

handler404 = 'appIntegradora.views.handler404'
handler500 = 'appIntegradora.views.handler500'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/canales/', include('canales.urls')),
    path('api/paquetes/', include('paquetes.urls')),
    path('api/clientes/', include('clientes.urls')),
    path('api/contratos/', include('contratos.urls')),
    path('usuarios/', include('usuarios.urls')),
]
