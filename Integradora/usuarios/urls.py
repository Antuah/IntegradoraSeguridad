from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import views as auth_views

#Definir un router
router = SimpleRouter()
router.register(r'api',UserViewSet)



urlpatterns = [
    path('', include(router.urls)),
    #Este es el path para iniciar sesión
    #Es POST y espera que le mandemos email y password
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    #El siguiente path es para refrescar el token de sesión
    #(Si es que eso queremos porque podriamos iniciar sesión de nuevo simplemente)
    path('token/refresh/', TokenRefreshView.as_view(), name='Token_refresh'),
    #Path que sirve el formulario
    path('form/', CustomUserFormAPI.as_view(), name='formulario' ),
    path('logout/', logout_view, name='logout'),
    
    # Password reset endpoints
    path('password-reset/', PasswordResetView.as_view(), name='password_reset'),
    path('password-reset/done/', PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('password-reset-complete/', PasswordResetCompleteView.as_view(), name='password_reset_complete'),
]