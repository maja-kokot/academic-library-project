# In backend/api/views.py
from django.shortcuts import render

# Create your views here.


from rest_framework import viewsets
from rest_framework.response import Response
from .models import AcademicArea, Resource, ResourceConnection, CanvasItem, Task
from .serializers import (
    AcademicAreaSerializer, 
    AcademicAreaDetailSerializer,
    ResourceSerializer, 
    ResourceConnectionSerializer, 
    CanvasItemSerializer, 
    TaskSerializer
)

# A ViewSet for AcademicArea that provides all standard CRUD operations.
class AcademicAreaViewSet(viewsets.ModelViewSet):
    queryset = AcademicArea.objects.all()
    serializer_class = AcademicAreaSerializer
    lookup_field = 'slug'
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # When we retrieve a single area, we use the DETAILED serializer
        serializer = AcademicAreaDetailSerializer(instance)
        return Response(serializer.data)

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer

class ResourceConnectionViewSet(viewsets.ModelViewSet):
    queryset = ResourceConnection.objects.all()
    serializer_class = ResourceConnectionSerializer

class CanvasItemViewSet(viewsets.ModelViewSet):
    queryset = CanvasItem.objects.all()
    serializer_class = CanvasItemSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer