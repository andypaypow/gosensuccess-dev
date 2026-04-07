from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DonationTypeViewSet,
    DonationViewSet,
    getsumb_webhook,
    donation_types_public,
)

router = DefaultRouter()
router.register(r"donation-types", DonationTypeViewSet, basename="donationtype")
router.register(r"donations", DonationViewSet, basename="donation")

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/webhook/getsumb/", getsumb_webhook, name="getsumb_webhook"),
    path("api/public/donation-types/", donation_types_public, name="donation_types_public"),
]
