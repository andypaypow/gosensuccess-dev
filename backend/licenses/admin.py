from django.contrib import admin
from .models import License, LicenseLog


@admin.register(License)
class LicenseAdmin(admin.ModelAdmin):
    list_display = ['key', 'email', 'status', 'trial_period', 'created_at', 'expires_at', 'activation_count']
    list_filter = ['status', 'trial_period', 'created_at']
    search_fields = ['key', 'email', 'device_id']
    readonly_fields = ['key', 'created_at', 'last_validated']
    
    fieldsets = (
        ('Informations de la licence', {
            'fields': ('key', 'email', 'status')
        }),
        ('Période d\'essai', {
            'fields': ('trial_period',)
        }),
        ('Dates', {
            'fields': ('created_at', 'activated_at', 'expires_at', 'last_validated')
        }),
        ('Limitations', {
            'fields': ('max_activations', 'activation_count')
        }),
        ('Métadonnées', {
            'fields': ('device_id', 'app_version', 'notes')
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing an existing object
            return self.readonly_fields + ['activation_count']
        return self.readonly_fields


@admin.register(LicenseLog)
class LicenseLogAdmin(admin.ModelAdmin):
    list_display = ['license', 'action', 'timestamp', 'device_id', 'ip_address']
    list_filter = ['action', 'timestamp']
    search_fields = ['license__key', 'license__email', 'device_id', 'details']
    readonly_fields = ['license', 'action', 'timestamp', 'device_id', 'ip_address', 'details']
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


# Personnaliser le titre de l'admin
admin.site.site_header = 'Gosen Success - Gestion des Licences'
admin.site.site_title = 'Administration des Licences'
admin.site.index_title = 'Bienvenue sur le portail de gestion des licences'
