from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/canales/', include('canales.urls')),
    path('api/paquetes/', include('paquetes.urls')),
]
