from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LicenseViewSet, LicenseLogViewSet, getsumb_webhook, get_license_by_phone, user_register, user_login, user_verify_session, user_logout

router = DefaultRouter()
router.register(r'licenses', LicenseViewSet, basename='license')
router.register(r'logs', LicenseLogViewSet, basename='log')

urlpatterns = [
    path('api/', include(router.urls)),
    path('webhook/getsumb/', getsumb_webhook, name='getsumb_webhook'),
    path('api/license/recover/', get_license_by_phone, name='get_license_by_phone'),
    path('api/auth/register/', user_register, name='user_register'),
    path('api/auth/login/', user_login, name='user_login'),
    path('api/auth/verify/', user_verify_session, name='user_verify_session'),
    path('api/auth/logout/', user_logout, name='user_logout'),
    
    
]
