from rest_framework import serializers
from .models import DonationType, Donation


class DonationTypeSerializer(serializers.ModelSerializer):
    amount_int = serializers.IntegerField(source="amount", read_only=True)
    operator_display = serializers.CharField(source="get_operator_display", read_only=True)

    class Meta:
        model = DonationType
        fields = [
            "id",
            "name",
            "description",
            "amount",
            "amount_int",
            "amount_eur",
            "is_active",
            "order",
            "icon",
            "operator",
            "operator_display",
            "payment_url",
        ]


class DonationSerializer(serializers.ModelSerializer):
    donation_type_name = serializers.CharField(source="donation_type.name", read_only=True)

    class Meta:
        model = Donation
        fields = [
            "id",
            "transaction_id",
            "reference",
            "merchant_reference_id",
            "amount",
            "fees",
            "total_amount",
            "amount_credited",
            "currency",
            "phone_number",
            "email",
            "operator",
            "status",
            "donation_type",
            "donation_type_name",
            "created_at",
            "updated_at",
        ]
