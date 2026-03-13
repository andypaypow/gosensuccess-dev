from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LicenseViewSet, LicenseLogViewSet

router = DefaultRouter()
router.register(r'licenses', LicenseViewSet, basename='license')
router.register(r'logs', LicenseLogViewSet, basename='log')

urlpatterns = [
    path('api/', include(router.urls)),
]
