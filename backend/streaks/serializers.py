from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import Streaks

class StreaksSerializer(serializers.ModelSerializer):
    class Meta:
        model = Streaks
        fields = '__all__'  # or a list of field names

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        # token['custom_field'] = 'custom_value'

        return token
