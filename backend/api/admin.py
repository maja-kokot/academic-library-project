# In backend/api/admin.py

from django.contrib import admin
from .models import AcademicArea, Resource, ResourceConnection, CanvasItem, Task

# Register your models here.
admin.site.register(AcademicArea)
admin.site.register(Resource)
admin.site.register(ResourceConnection)
admin.site.register(CanvasItem)
admin.site.register(Task)