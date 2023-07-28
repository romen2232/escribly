from rest_framework import viewsets
from .models import Notes
from .serializers import NotesSerializer


from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def secure_view(request):
    # Tu lógica de vista segura aquí
    return Response('Esta vista está protegida por JWT.', status=200)

class CustomTokenObtainPairView(TokenObtainPairView):
    # Puedes personalizar el serializador de tokens aquí si es necesario
    # serializer_class = CustomTokenObtainPairSerializer
    pass

class NotesViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Notes.objects.all()
    serializer_class = NotesSerializer
