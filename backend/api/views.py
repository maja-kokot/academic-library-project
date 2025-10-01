# In backend/api/views.py

from rest_framework import viewsets
from rest_framework.response import Response
from .models import *
from .serializers import * # Import all serializers from our new file

class AcademicAreaViewSet(viewsets.ModelViewSet):
    queryset = AcademicArea.objects.all()
    serializer_class = AcademicAreaSerializer
    lookup_field = 'slug'
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = AcademicAreaDetailSerializer(instance)
        return Response(serializer.data)

# THIS IS THE CORRECTED PART
class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    # Use our new, manual ResourceSerializer, NOT the old name.
    serializer_class = ResourceSerializer 

# The rest of the viewsets are standard
class ResourceConnectionViewSet(viewsets.ModelViewSet):
    queryset = ResourceConnection.objects.all()
    serializer_class = ResourceConnectionSerializer

class CanvasItemViewSet(viewsets.ModelViewSet):
    queryset = CanvasItem.objects.all()
    serializer_class = CanvasItemSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    
class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer