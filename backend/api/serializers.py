# In backend/api/serializers.py

from rest_framework import serializers
from .models import AcademicArea, Resource, ResourceConnection, CanvasItem, Task

# A simple serializer for Resource, to be nested inside other serializers
class NestedResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ['id', 'title', 'resource_type', 'authors', 'url']

# This serializer now includes the full, nested resource details.
class CanvasItemSerializer(serializers.ModelSerializer):
    resource = NestedResourceSerializer(read_only=True)
    class Meta:
        model = CanvasItem
        fields = ['id', 'resource', 'pos_x', 'pos_y']

# This serializer now includes the source and target resource details.
class ResourceConnectionSerializer(serializers.ModelSerializer):
    # We use slugs to identify the resources when creating/updating connections
    source = serializers.SlugRelatedField(slug_field='id', queryset=Resource.objects.all())
    target = serializers.SlugRelatedField(slug_field='id', queryset=Resource.objects.all())
    class Meta:
        model = ResourceConnection
        fields = ['id', 'source', 'target', 'label', 'area']

# This serializer is for the main list views (unchanged for now)
class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = '__all__'

# This serializer is for the main list views (unchanged for now)
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

# The main serializer for the AcademicArea, to be used for list views
class AcademicAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicArea
        fields = ['id', 'name', 'slug', 'description']

# A NEW, detailed serializer specifically for the single workspace view
class AcademicAreaDetailSerializer(serializers.ModelSerializer):
    # These lines tell Django to use our new detail serializers
    # to include all the related items in the API response.
    canvas_items = CanvasItemSerializer(many=True, read_only=True)
    connections = ResourceConnectionSerializer(many=True, read_only=True)
    resources = ResourceSerializer(many=True, read_only=True)
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = AcademicArea
        fields = [
            'id', 'name', 'slug', 'description', 
            'canvas_items', 'connections', 'resources', 'tasks'
        ]