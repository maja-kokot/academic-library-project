# In backend/api/models.py

from django.db import models

# 1. The highest-level container for a subject or project.
class AcademicArea(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

# 2. A resource (book, paper, link) that belongs to a specific AcademicArea.
class Resource(models.Model):
    # Defines the types of resources we can have.
    RESOURCE_TYPES = [
        ('BOOK', 'Book'),
        ('PAPER', 'Paper'),
        ('LINK', 'Link'),
        ('NOTE', 'Note'),
        ('PDF', 'PDF'),
    ]

    # Each Resource must belong to one AcademicArea.
    # If the Area is deleted, all its Resources are also deleted (CASCADE).
    # related_name lets us easily get all resources for an area, e.g., my_area.resources.all()
    area = models.ForeignKey(AcademicArea, on_delete=models.CASCADE, related_name='resources')
    
    title = models.CharField(max_length=300)
    resource_type = models.CharField(max_length=5, choices=RESOURCE_TYPES)
    
    # Optional fields that may not apply to all resource types.
    authors = models.CharField(max_length=500, blank=True, null=True)
    publication_year = models.IntegerField(blank=True, null=True)
    url = models.URLField(max_length=500, blank=True, null=True)
    file = models.FileField(upload_to='uploads/', blank=True, null=True)
    content = models.TextField(blank=True, null=True) # For notes

    def __str__(self):
        return f"{self.title} ({self.get_resource_type_display()})"

# 3. The permanent, "hardcoded" connection between two Resources within an Area.
class ResourceConnection(models.Model):
    # The connection exists within one specific area.
    area = models.ForeignKey(AcademicArea, on_delete=models.CASCADE, related_name='connections')
    
    # The start and end points of the connection.
    # related_name='source_connections' lets us find all connections starting from a resource.
    source = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='source_connections')
    target = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='target_connections')
    
    label = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.source.title} -> {self.target.title} ({self.label})"

# 4. The visual representation of a Resource on the canvas for a specific Area.
class CanvasItem(models.Model):
    area = models.ForeignKey(AcademicArea, on_delete=models.CASCADE, related_name='canvas_items')
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='canvas_placements')
    
    # X and Y coordinates for positioning on the frontend canvas.
    pos_x = models.IntegerField(default=0)
    pos_y = models.IntegerField(default=0)

    def __str__(self):
        return f"Canvas item for '{self.resource.title}' in '{self.area.name}'"

# 5. A to-do item, which can optionally reference a Resource.
class Task(models.Model):
    area = models.ForeignKey(AcademicArea, on_delete=models.CASCADE, related_name='tasks')
    
    # The 'resource' field is optional.
    # on_delete=models.SET_NULL means if the resource is deleted, this field becomes empty (null)
    # instead of deleting the whole task.
    resource = models.ForeignKey(Resource, on_delete=models.SET_NULL, blank=True, null=True)
    
    description = models.CharField(max_length=500)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.description} (Completed: {self.is_completed})"