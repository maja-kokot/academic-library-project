# In backend/api/serializers.py
from rest_framework import serializers
from .models import *

# First, define the serializers for the specific "details" of each resource type.
class CourseDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['lecturer', 'website']

class BookDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['authors', 'url']

class PaperDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paper
        fields = ['authors', 'publication_year']

class WebResourceDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebResource
        fields = ['url']

class PDFResourceDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDFResource
        fields = ['file']

# Now, create the main Resource serializer that will manually include the details.
# This is the corrected version.
class ResourceSerializer(serializers.ModelSerializer):
    details = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = ['id', 'area', 'title', 'resource_type', 'details']

    def get_details(self, obj):
        # This method checks the resource_type and returns the correct detail data.
        try:
            if obj.resource_type == 'course':
                return CourseDetailSerializer(obj.course_details).data
            if obj.resource_type == 'book':
                return BookDetailSerializer(obj.book_details).data
            if obj.resource_type == 'paper':
                return PaperDetailSerializer(obj.paper_details).data
            if obj.resource_type == 'web':
                return WebResourceDetailSerializer(obj.web_details).data
            if obj.resource_type == 'pdf':
                return PDFResourceDetailSerializer(obj.pdf_details).data
        except AttributeError:
             # This can happen if the child object hasn't been created yet.
            return None
        return None

# The rest of the serializers follow.
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'content', 'resource', 'area', 'updated_at']

class SimpleResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ['id', 'title', 'resource_type']

class CanvasItemSerializer(serializers.ModelSerializer):
    # This is the new, smarter way to handle this.
    # On read (GET), we want to show the full resource details.
    # On write (POST), we want to accept just the resource ID.
    def to_representation(self, instance):
        # Get the default representation
        rep = super().to_representation(instance)
        # On GET requests, replace the resource ID with the full serialized resource data
        rep['resource'] = SimpleResourceSerializer(instance.resource).data
        return rep

    class Meta:
        model = CanvasItem
        # The fields list now includes 'area' and 'resource'.
        # By default, DRF will treat 'area' and 'resource' as fields
        # that accept the integer IDs on POST requests, which is exactly what we need.
        fields = ['id', 'area', 'resource', 'pos_x', 'pos_y']

class ResourceConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceConnection
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

class AcademicAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicArea
        fields = ['id', 'name', 'slug', 'description']

class AcademicAreaDetailSerializer(serializers.ModelSerializer):
    resources = ResourceSerializer(many=True, read_only=True)
    canvas_items = CanvasItemSerializer(many=True, read_only=True)
    connections = ResourceConnectionSerializer(many=True, read_only=True)
    tasks = TaskSerializer(many=True, read_only=True)
    notes = NoteSerializer(many=True, read_only=True)

    class Meta:
        model = AcademicArea
        fields = [
            'id', 'name', 'slug', 'description', 
            'resources', 'canvas_items', 'connections', 'tasks', 'notes'
        ]