from django.contrib import admin
from .models import DonationType, Donation


@admin.register(DonationType)
class DonationTypeAdmin(admin.ModelAdmin):
    list_display = ["name", "amount", "operator", "is_active", "order"]
    list_filter = ["operator", "is_active", "order"]
    search_fields = ["name", "description"]
    
    fieldsets = (
        ("Informations", {
            "fields": ("name", "description", "icon", "order")
        }),
        ("Montants", {
            "fields": ("amount", "amount_eur")
        }),
        ("Configuration de paiement", {
            "fields": ("operator", "payment_url")
        }),
        ("Statut", {
            "fields": ("is_active",)
        }),
    )


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ["transaction_id", "amount", "status", "operator", "phone_number", "created_at"]
    list_filter = ["status", "operator", "created_at"]
    search_fields = ["transaction_id", "reference", "phone_number", "email"]
    readonly_fields = ["transaction_id", "reference", "merchant_reference_id", "raw_response", "created_at", "updated_at"]
    
    fieldsets = (
        ("Informations de transaction", {
            "fields": ("transaction_id", "reference", "merchant_reference_id", "status")
        }),
        ("Montants", {
            "fields": ("amount", "fees", "total_amount", "amount_credited", "currency")
        }),
        ("Contact", {
            "fields": ("phone_number", "email")
        }),
        ("Operateur", {
            "fields": ("operator", "donation_type")
        }),
        ("Reponse brute", {
            "fields": ("raw_response",)
        }),
    )


admin.site.site_header = "Gosen Success - Gestion des Dons"
admin.site.site_title = "Administration des Dons"
admin.site.index_title = "Bienvenue sur le portail de gestion des dons"
