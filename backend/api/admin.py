# In backend/api/admin.py
from django.contrib import admin
from .models import (
    AcademicArea, Resource, Course, Book, Paper, WebResource, PDFResource,
    ResourceConnection, CanvasItem, Task, Note
)

# A simple way to see the linked details in the main Resource admin
class CourseInline(admin.StackedInline): model = Course
class BookInline(admin.StackedInline): model = Book
class PaperInline(admin.StackedInline): model = Paper
class WebResourceInline(admin.StackedInline): model = WebResource
class PDFResourceInline(admin.StackedInline): model = PDFResource

class ResourceAdmin(admin.ModelAdmin):
    inlines = [CourseInline, BookInline, PaperInline, WebResourceInline, PDFResourceInline]

admin.site.register(AcademicArea)
admin.site.register(Resource, ResourceAdmin)
admin.site.register(ResourceConnection)
admin.site.register(CanvasItem)
admin.site.register(Task)
admin.site.register(Note)