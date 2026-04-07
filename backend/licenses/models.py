from django.db import models


class DonationType(models.Model):
    """Types de donations disponibles"""

    OPERATOR_CHOICES = [
        ("MOOV_GABON", "Moov Gabon"),
        ("AIRTEL_GABON", "Airtel Gabon"),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    amount = models.IntegerField()  # Montant en FCFA
    amount_eur = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    icon = models.CharField(max_length=10, blank=True, default="💝")

    # Configuration de paiement
    operator = models.CharField(max_length=20, choices=OPERATOR_CHOICES, blank=True, null=True)
    payment_url = models.URLField(max_length=500, blank=True, null=True, help_text="URL de paiement pour cet operateur")

    class Meta:
        ordering = ["order"]
        verbose_name = "Type de don"
        verbose_name_plural = "Types de dons"

    def __str__(self):
        return f"{self.name} - {self.amount} FCFA"


class Donation(models.Model):
    """Paiements de donations effectues"""

    STATUS_CHOICES = [
        ("pending", "En attente"),
        ("completed", "Complété"),
        ("failed", "Échoué"),
    ]

    OPERATOR_CHOICES = [
        ("AIRTEL_MONEY", "Airtel Money"),
        ("MOOV_MONEY", "Moov Money"),
        ("ORANGE_MONEY", "Orange Money"),
        ("WAVE", "Wave"),
        ("MTN_MONEY", "MTN Money"),
    ]

    donation_type = models.ForeignKey(DonationType, on_delete=models.SET_NULL, null=True, blank=True)
    transaction_id = models.CharField(max_length=255, unique=True)
    reference = models.CharField(max_length=255, blank=True, null=True)
    merchant_reference_id = models.CharField(max_length=255, blank=True, null=True)

    amount = models.IntegerField()
    fees = models.IntegerField(default=0)
    total_amount = models.IntegerField(default=0)
    amount_credited = models.IntegerField(default=0)
    currency = models.CharField(max_length=10, default="XOF")

    phone_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    operator = models.CharField(max_length=20, choices=OPERATOR_CHOICES, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    raw_response = models.JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Donation"
        verbose_name_plural = "Donations"

    def __str__(self):
        return f"{self.transaction_id} - {self.amount} {self.currency}"
