from django.db import models
import secrets
import string
from datetime import datetime, timedelta


def generate_license_key():
    """Génère une clé de licence complexe"""
    alphabet = string.ascii_uppercase + string.digits
    # Format: XXXX-XXXX-XXXX-XXXX
    parts = []
    for _ in range(4):
        part = ''.join(secrets.choice(alphabet) for _ in range(4))
        parts.append(part)
    return '-'.join(parts)


class License(models.Model):
    """Modèle de licence pour les applications"""
    
    TRIAL_PERIODS = [
        ('1h', '1 heure'),
        ('1d', '1 jour'),
        ('1w', '1 semaine'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expirée'),
        ('revoked', 'Révoquée'),
        ('trial', 'Période d\'essai'),
    ]
    
    # Informations de la licence
    key = models.CharField(max_length=19, unique=True, default=generate_license_key)
    email = models.EmailField(unique=True)
    device_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Multi-device support
    max_devices = models.IntegerField(default=1, help_text="Nombre d'appareils autorisés à utiliser cette licence")
    devices = models.JSONField(default=list, blank=True, help_text="Liste des device_ids autorisés")
    
    # Statut et dates
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='trial')
    trial_period = models.CharField(max_length=5, choices=TRIAL_PERIODS, default='1d')
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    activated_at = models.DateTimeField(blank=True, null=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    last_validated = models.DateTimeField(auto_now=True)
    
    # Limitations
    max_activations = models.IntegerField(default=1)
    activation_count = models.IntegerField(default=0)
    
    # Métadonnées
    app_version = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Licence'
        verbose_name_plural = 'Licences'
    
    def __str__(self):
        return f"{self.key} - {self.email}"
    
    def activate(self, device_id):
        """Active la licence pour un appareil"""
        if self.status == 'revoked' or self.status == 'expired':
            return False, "Licence révoquée ou expirée"
        
        if self.activation_count >= self.max_activations:
            return False, "Nombre d'activations maximum atteint"
        
        self.device_id = device_id
        self.activation_count += 1
        self.status = 'active'
        self.activated_at = datetime.now()
        
        # Définir la date d'expiration selon la période d'essai
        if self.trial_period == '1h':
            self.expires_at = datetime.now() + timedelta(hours=1)
        elif self.trial_period == '1d':
            self.expires_at = datetime.now() + timedelta(days=1)
        elif self.trial_period == '1w':
            self.expires_at = datetime.now() + timedelta(weeks=1)
        
        self.save()
        return True, "Licence activée avec succès"
    
    def is_valid(self):
        """Vérifie si la licence est valide"""
        if self.status == 'revoked':
            return False, "Licence révoquée"
        
        if self.expires_at and datetime.now() > self.expires_at:
            self.status = 'expired'
            self.save()
            return False, "Licence expirée"
        
        return True, "Licence valide"
    
    def get_trial_end_date(self):
        """Retourne la date de fin de période d'essai"""
        if self.trial_period == '1h':
            return self.created_at + timedelta(hours=1)
        elif self.trial_period == '1d':
            return self.created_at + timedelta(days=1)
        elif self.trial_period == '1w':
            return self.created_at + timedelta(weeks=1)
        return None



class User(models.Model):
    """Modèle d'utilisateur avec numéro de téléphone comme identifiant unique"""
    
    phone = models.CharField(max_length=20, unique=True, help_text='Numéro de téléphone unique')
    email = models.EmailField(blank=True, null=True)
    pin_code = models.CharField(max_length=10, blank=True, help_text='Code PIN pour connexion')
    session_token = models.CharField(max_length=100, unique=True, null=True, blank=True)
    session_expires = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    max_devices = models.IntegerField(default=1, help_text="Nombre d'appareils autorisés")
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(blank=True, null=True)
    license = models.OneToOneField('License', on_delete=models.SET_NULL, null=True, blank=True, related_name="user")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        indexes = [
            models.Index(fields=['phone']),
            models.Index(fields=['session_token']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.phone} - {'Actif' if self.is_active else 'Inactif'}"
    
    def generate_session_token(self):
        """Génère un nouveau token de session"""
        import secrets
        self.session_token = 'sess_' + secrets.token_hex(32)
        from django.utils import timezone
        from datetime import timedelta
        self.session_expires = timezone.now() + timedelta(days=30)
        self.last_login = timezone.now()
        self.save()
        return self.session_token
    
    def is_session_valid(self):
        """Vérifie si la session est valide"""
        if not self.is_active or not self.session_token or not self.session_expires:
            return False
        from django.utils import timezone
        return timezone.now() < self.session_expires
    
    def logout(self):
        """Déconnecte l'utilisateur"""
        self.session_token = None
        self.session_expires = None
        self.save()

class LicenseLog(models.Model):
    """Journal des activations et validations"""
    
    ACTION_CHOICES = [
        ('generated', 'Licence générée'),
        ('activated', 'Licence activée'),
        ('validated', 'Licence validée'),
        ('expired', 'Licence expirée'),
        ('revoked', 'Licence révoquée'),
        ('failed', 'Échec validation'),
    ]
    
    license = models.ForeignKey(License, on_delete=models.CASCADE, related_name='logs')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    device_id = models.CharField(max_length=255, blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Journal de licence'
        verbose_name_plural = 'Journaux de licence'
    
    def __str__(self):
        return f"{self.license.key} - {self.action} - {self.timestamp}"



class PaymentConfig(models.Model):
    OPERATOR_CHOICES = [
        ("moov", "Moov Gabon"),
        ("airtel", "Airtel Gabon"),
    ]
    
    operator = models.CharField(max_length=20, choices=OPERATOR_CHOICES, unique=True)
    payment_url = models.URLField(max_length=500)
    product_id = models.CharField(max_length=100)
    operation_account_code = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Configuration de paiement"
        verbose_name_plural = "Configurations de paiement"
    
    def __str__(self):
        return "{} - {} FCFA".format(self.get_operator_display(), self.amount)


class Payment(models.Model):
    STATUS_CHOICES = [
        ("pending", "En attente"),
        ("success", "Succès"),
        ("failed", "Échoué"),
    ]
    
    merchant_reference_id = models.CharField(max_length=100, unique=True)
    reference = models.CharField(max_length=100)
    transaction_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=0)
    fees = models.DecimalField(max_digits=10, decimal_places=0, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=0, null=True)
    amount_credited = models.DecimalField(max_digits=10, decimal_places=0, null=True)
    customer_id = models.CharField(max_length=50, blank=True)
    numero_tel = models.CharField(max_length=50, blank=True)
    operator = models.CharField(max_length=50)
    account_operation_code = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    code = models.IntegerField(null=True)
    raw_data = models.JSONField(default=dict)
    timestamp = models.DateTimeField()
    received_at = models.DateTimeField(auto_now_add=True)
    license = models.OneToOneField(License, on_delete=models.SET_NULL, null=True, blank=True, related_name="payment")
    
    class Meta:
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"
        ordering = ["-received_at"]
    
    def __str__(self):
        return "{} - {} FCFA - {}".format(self.transaction_id, self.amount, self.status)
    
    def create_license(self):
        from django.utils import timezone
        if self.status == "success" and not self.license:
            license = License.objects.create(
                email="{}@payment.local".format(self.numero_tel),
                status="active",
                trial_period="1w",
                activated_at=timezone.now(),
                expires_at=None
            )
            self.license = license
            self.save()
            LicenseLog.objects.create(
                license=license,
                action="activated",
                device_id=self.numero_tel,
                details="Licence créée automatiquement après paiement {}".format(self.transaction_id)
            )
            return license
        return None
