from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BitacoraViewSet, health_check

router = DefaultRouter()
router.register(r'bitacora', BitacoraViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('health-check/', health_check, name='bitacora-health-check'),
]