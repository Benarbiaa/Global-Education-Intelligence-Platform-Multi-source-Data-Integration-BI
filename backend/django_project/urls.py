from django.urls import path, include

urlpatterns = [
    path("api/", include("apps.api.urls")),  # include API app URLs
]
