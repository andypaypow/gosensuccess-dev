from django.contrib import admin
from .models import License, LicenseLog, PaymentConfig, Payment, User


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
        ('Periode d\'essai', {
            'fields': ('trial_period',)
        }),
        ('Dates', {
            'fields': ('created_at', 'activated_at', 'expires_at', 'last_validated')
        }),
        ('Limitations', {
            'fields': ('max_activations', 'activation_count')
        }),
        ('Metadonnees', {
            'fields': ('device_id', 'app_version', 'notes')
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:
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


@admin.register(PaymentConfig)
class PaymentConfigAdmin(admin.ModelAdmin):
    list_display = ['operator', 'amount', 'is_active', 'created_at']
    list_filter = ['operator', 'is_active', 'created_at']
    search_fields = ['operator', 'product_id', 'operation_account_code']
    fieldsets = (
        ('Configuration Getsumb', {
            'fields': ('operator', 'payment_url', 'product_id', 'operation_account_code')
        }),
        ('Montant', {
            'fields': ('amount',)
        }),
        ('Statut', {
            'fields': ('is_active',)
        }),
    )


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'amount', 'status', 'code', 'operator', 'received_at']
    list_filter = ['status', 'code', 'operator', 'received_at']
    search_fields = ['transaction_id', 'merchant_reference_id', 'numero_tel']
    readonly_fields = ['transaction_id', 'merchant_reference_id', 'reference', 'amount', 
                       'fees', 'total_amount', 'amount_credited', 'customer_id', 'numero_tel',
                       'operator', 'account_operation_code', 'status', 'code', 'raw_data',
                       'timestamp', 'received_at', 'license']
    
    fieldsets = (
        ('Informations transaction', {
            'fields': ('transaction_id', 'merchant_reference_id', 'reference')
        }),
        ('Montants', {
            'fields': ('amount', 'fees', 'total_amount', 'amount_credited')
        }),
        ('Client', {
            'fields': ('customer_id', 'numero_tel')
        }),
        ('Operateur', {
            'fields': ('operator', 'account_operation_code')
        }),
        ('Statut', {
            'fields': ('status', 'code')
        }),
        ('Dates', {
            'fields': ('timestamp', 'received_at')
        }),
        ('Licence creee', {
            'fields': ('license',)
        }),
        ('Donnees brutes', {
            'fields': ('raw_data',)
        }),
    )
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False






@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['phone', 'get_session_status', 'max_devices', 'is_active', 'last_login', 'created_at']
    list_filter = ['is_active', 'created_at', 'last_login']
    search_fields = ['phone', 'email', 'session_token']
    readonly_fields = ['session_token', 'session_expires', 'created_at', 'last_login']
    
    fieldsets = (
        ('Informations utilisateur', {
            'fields': ('phone', 'email', 'pin_code', 'is_active')
        }),
        ('Appareils', {
            'fields': ('max_devices',)
        }),
        ('Session', {
            'fields': ('session_token', 'session_expires')
        }),
        ('Licence', {
            'fields': ('license',)
        }),
        ('Dates', {
            'fields': ('created_at', 'last_login')
        }),
    )
    
    def get_session_status(self, obj):
        if obj.is_session_valid():
            return 'Actif'
        return 'Inactif'
    get_session_status.short_description = 'Session'
    
    actions = ['disconnect_users']
    
    def disconnect_users(self, request, queryset):
        """Déconnecte les utilisateurs sélectionnés"""
        count = 0
        for user in queryset:
            user.logout()
            count += 1
        self.message_user(request, f'{count} utilisateur(s) déconnecté(s)')
    disconnect_users.short_description = 'Déconnecter les utilisateurs sélectionnés'


admin.site.site_header = 'Gosen Success - Gestion des Licences'
admin.site.site_title = 'Administration des Licences'
admin.site.index_title = 'Bienvenue sur le portail de gestion des licences'
