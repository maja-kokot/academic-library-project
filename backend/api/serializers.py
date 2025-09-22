# In backend/api/serializers.py

from rest_framework import serializers
from .models import AcademicArea, Resource, ResourceConnection, CanvasItem, Task

class AcademicAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicArea
        fields = '__all__'

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = '__all__'

class ResourceConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceConnection
        fields = '__all__'

class CanvasItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CanvasItem
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'