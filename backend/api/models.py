# In backend/api/models.py

from django.db import models

class AcademicArea(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True, null=True)
    def __str__(self): return self.name

class Resource(models.Model):
    RESOURCE_TYPES = [
        ('course', 'Course'), ('book', 'Book'), ('paper', 'Paper'),
        ('web', 'Web Resource'), ('pdf', 'PDF Resource'),
    ]
    area = models.ForeignKey(AcademicArea, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=300)
    resource_type = models.CharField(max_length=10, choices=RESOURCE_TYPES)
    def __str__(self): return self.title

class Course(models.Model):
    resource = models.OneToOneField(Resource, on_delete=models.CASCADE, primary_key=True, related_name='course_details')
    lecturer = models.CharField(max_length=200, blank=True, null=True)
    website = models.URLField(max_length=500, blank=True, null=True)

class Book(models.Model):
    resource = models.OneToOneField(Resource, on_delete=models.CASCADE, primary_key=True, related_name='book_details')
    authors = models.CharField(max_length=500, blank=True, null=True)
    url = models.URLField(max_length=500, blank=True, null=True)

class Paper(models.Model):
    resource = models.OneToOneField(Resource, on_delete=models.CASCADE, primary_key=True, related_name='paper_details')
    authors = models.CharField(max_length=500, blank=True, null=True)
    publication_year = models.IntegerField(blank=True, null=True)

class WebResource(models.Model):
    resource = models.OneToOneField(Resource, on_delete=models.CASCADE, primary_key=True, related_name='web_details')
    url = models.URLField(max_length=500, blank=True, null=True)

class PDFResource(models.Model):
    resource = models.OneToOneField(Resource, on_delete=models.CASCADE, primary_key=True, related_name='pdf_details')
    file = models.FileField(upload_to='uploads/', blank=True, null=True)

class Note(models.Model):
    area = models.ForeignKey(AcademicArea, on_delete=models.CASCADE, related_name='notes')
    resource = models.ForeignKey(Resource, on_delete=models.SET_NULL, blank=True, null=True, related_name='notes')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ResourceConnection(models.Model):
    area = models.ForeignKey(AcademicArea, on_delete=models.CASCADE, related_name='connections')
    source = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='source_connections')
    target = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='target_connections')
    label = models.CharField(max_length=100)

class CanvasItem(models.Model):
    area = models.ForeignKey(AcademicArea, on_delete=models.CASCADE, related_name='canvas_items')
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='canvas_placements')
    pos_x = models.IntegerField(default=0)
    pos_y = models.IntegerField(default=0)

class Task(models.Model):
    area = models.ForeignKey(AcademicArea, on_delete=models.CASCADE, related_name='tasks')
    resource = models.ForeignKey(Resource, on_delete=models.SET_NULL, blank=True, null=True)
    description = models.CharField(max_length=500)
    is_completed = models.BooleanField(default=False)