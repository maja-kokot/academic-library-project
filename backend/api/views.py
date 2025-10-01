# In backend/api/views.py

from rest_framework import viewsets, status
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
    
    def create(self, request, *args, **kwargs):
        # 1. Get the data from the frontend request
        data = request.data
        resource_type = data.get('resource_type')

        # 2. Create the base Resource object
        try:
            base_resource = Resource.objects.create(
                area_id=data.get('area'),
                title=data.get('title'),
                resource_type=resource_type
            )
        except Exception as e:
            return Response({'error': f'Failed to create base resource: {e}'}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Based on the type, create the specific child object
        if resource_type == 'course':
            Course.objects.create(
                resource=base_resource,
                lecturer=data.get('lecturer', ''),
                website=data.get('website', '')
            )
        elif resource_type == 'book':
            Book.objects.create(
                resource=base_resource,
                authors=data.get('authors', ''),
                url=data.get('url', '')
            )
        elif resource_type == 'paper':
            Paper.objects.create(
                resource=base_resource,
                authors=data.get('authors', ''),
                publication_year=data.get('publication_year')
            )
        elif resource_type == 'web':
            WebResource.objects.create(
                resource=base_resource,
                url=data.get('url', '')
            )
        # Add other types (like PDF) here as needed

        # 4. Serialize the complete, newly created object and send it back
        serializer = self.get_serializer(base_resource)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

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