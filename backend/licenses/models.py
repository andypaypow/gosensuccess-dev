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
