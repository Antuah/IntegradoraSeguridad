from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoriaViewSet, CanalViewSet

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet)
router.register(r'canales', CanalViewSet)

urlpatterns = [
    path('', include(router.urls)),
]