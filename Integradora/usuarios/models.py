from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission
from django.db import models
from django.utils.timezone import now
import uuid

class Rol(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=255, unique=True)
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return self.nombre

class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, rol=None, **extra_fields):
        if not username:
            raise ValueError('El nombre de usuario es obligatorio')
        
        if not rol:
            raise ValueError('Debe asignar un rol al usuario')
        
        user = self.model(
            username=username,
            rol=rol,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        rol_admin, _ = Rol.objects.get_or_create(nombre='Administrador')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, password, rol=rol_admin, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True)
    
    nombre = models.CharField(max_length=255)
    apellido = models.CharField(max_length=255)

    rol = models.ForeignKey(Rol, on_delete=models.PROTECT)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    fecha_registro = models.DateTimeField(default=now)

    groups = models.ManyToManyField(
        Group,
        related_name="customuser_groups",
        blank=True
    )

    user_permissions = models.ManyToManyField(
        Permission,
        related_name="customuser_permissions",
        blank=True
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['nombre', 'apellido', 'rol']

    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.rol})"