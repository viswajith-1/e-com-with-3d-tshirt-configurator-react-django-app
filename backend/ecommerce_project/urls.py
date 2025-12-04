"""
ecommerce_project URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # The built-in Django admin interface
    path('admin/', admin.site.urls),

    # Include all URLs from our 'api' app, prefixed with 'api/'
    # e.g., /api/products/, /api/auth/login/
    path('api/', include('api.urls')),
]

# This is a crucial step for development.
# It tells Django to serve media files (like product images) through the Django development server.
# In a production environment, you would typically configure a web server like Nginx to handle this.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

