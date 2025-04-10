from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import CustomUserSerializer, CustomTokenObtainPairSerializer
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

class CustomTokenObtainPairView(TokenObtainPairView):
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
            User = get_user_model()
            User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password1']
            )
            return Response({'message': 'Usuario creado correctamente'}, status=status.HTTP_201_CREATED)
        else:
            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)
