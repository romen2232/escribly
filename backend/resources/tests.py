from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from .models import Resources
from .serializers import ResourcesSerializer
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

class ResourcesViewSetTestCase(APITestCase):
    """Test the ResourcesViewSet."""

    def setUp(self):
        self.client = APIClient()
        self.resources_data = {'field1': 'Test field1', 'field2': 'Test field2'}
        self.user = User.objects.create_user(username='testuser', password='testpass')
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        self.response = self.client.post(reverse('resources-list'), self.resources_data, format="json")
        self.assertEqual(self.response.status_code, status.HTTP_201_CREATED)

    def test_can_retrieve_resources(self):
        resources_id = self.response.data['id']
        response = self.client.get(reverse('resources-detail', kwargs={'pk': resources_id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_can_update_resources(self):
        resources_id = self.response.data['id']
        response = self.client.put(
            reverse('resources-detail', kwargs={'pk': resources_id}),
            {
                'field1': 'Updated field1',
                'field2': 'Updated field2'
            },
            format='json'
        )
        if response.status_code != status.HTTP_200_OK:
            print(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class JWTAuthTestCase(APITestCase):
    """Test JWT authentication."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass')

    def test_can_obtain_token(self):
        response = self.client.post(reverse('token_obtain_pair'), {'username': 'testuser', 'password': 'testpass'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_cannot_access_view_without_token(self):
        self.client.credentials(HTTP_AUTHORIZATION='')
        response = self.client.get(reverse('resources-list'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
