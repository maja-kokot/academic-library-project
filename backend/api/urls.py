# In backend/api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AcademicAreaViewSet,
    ResourceViewSet,
    ResourceConnectionViewSet,
    CanvasItemViewSet,
    TaskViewSet
)

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'areas', AcademicAreaViewSet, basename='academicarea')
router.register(r'resources', ResourceViewSet, basename='resource')
router.register(r'connections', ResourceConnectionViewSet, basename='resourceconnection')
router.register(r'canvas-items', CanvasItemViewSet, basename='canvasitem')
router.register(r'tasks', TaskViewSet, basename='task')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]