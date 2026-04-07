from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from .models import DonationType, Donation
from .serializers import DonationTypeSerializer, DonationSerializer
import secrets


class DonationTypeViewSet(viewsets.ModelViewSet):
    """ViewSet pour gerer les types de dons"""

    queryset = DonationType.objects.filter(is_active=True)
    serializer_class = DonationTypeSerializer


class DonationViewSet(viewsets.ModelViewSet):
    """ViewSet pour gerer les donations"""

    queryset = Donation.objects.all()
    serializer_class = DonationSerializer

    def create(self, request, *args, **kwargs):
        """Creer une nouvelle donation"""
        donation_type_id = request.data.get("donation_type_id")
        phone_number = request.data.get("phone_number")
        email = request.data.get("email", "")

        try:
            donation_type = DonationType.objects.get(id=donation_type_id)
        except DonationType.DoesNotExist:
            return Response(
                {"success": False, "message": "Type de don invalide"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Generer un ID de transaction unique
        transaction_id = f"DON{secrets.token_hex(8).upper()}"

        donation = Donation.objects.create(
            donation_type=donation_type,
            transaction_id=transaction_id,
            amount=donation_type.amount,
            phone_number=phone_number,
            email=email,
            status="pending",
        )

        return Response(
            {
                "success": True,
                "donation": DonationSerializer(donation).data,
                "payment_url": donation_type.payment_url,
                "operator": donation_type.get_operator_display() if donation_type.operator else None,
            }
        )

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Statistiques des donations"""
        from django.db import models

        total = Donation.objects.count()
        completed = Donation.objects.filter(status="completed").count()
        pending = Donation.objects.filter(status="pending").count()
        failed = Donation.objects.filter(status="failed").count()
        total_amount = (
            Donation.objects.filter(status="completed").aggregate(total=models.Sum("amount"))["total"]
            or 0
        )

        return Response(
            {
                "total": total,
                "completed": completed,
                "pending": pending,
                "failed": failed,
                "total_amount": total_amount,
            }
        )

    @action(detail=False, methods=["post"])
    def check_status(self, request):
        """Verifier le statut d'une donation par telephone"""
        phone_number = request.data.get("phone_number")
        if not phone_number:
            return Response(
                {"success": False, "message": "Numero de telephone requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        donations = Donation.objects.filter(phone_number=phone_number).order_by("-created_at")[:5]

        return Response(
            {
                "success": True,
                "donations": DonationSerializer(donations, many=True).data,
            }
        )


@api_view(["POST"])
def getsumb_webhook(request):
    """Webhook pour recevoir les notifications de Getsumb"""
    data = request.data

    # Extraire les donnees du webhook
    transaction_id = data.get("transactionId")
    reference = data.get("reference")
    merchant_reference_id = data.get("merchantReferenceId")
    status_code = data.get("code")
    webhook_status = data.get("status")

    if not transaction_id:
        return Response(
            {"success": False, "message": "transactionId manquant"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Mettre a jour la donation
    try:
        donation = Donation.objects.get(transaction_id=transaction_id)
    except Donation.DoesNotExist:
        # Creer une nouvelle donation si elle n'existe pas
        donation = Donation.objects.create(
            transaction_id=transaction_id,
            reference=reference,
            merchant_reference_id=merchant_reference_id,
            amount=data.get("amount", 0),
            fees=data.get("fees", 0),
            total_amount=data.get("totalAmount", data.get("amount", 0)),
            amount_credited=data.get("amountCredited", data.get("amount", 0)),
            phone_number=data.get("numero_tel") or data.get("customerID", ""),
            operator=data.get("operator", ""),
        )

    # Mettre a jour les champs
    donation.reference = reference
    donation.merchant_reference_id = merchant_reference_id
    donation.fees = data.get("fees", 0)
    donation.total_amount = data.get("totalAmount", donation.amount)
    donation.amount_credited = data.get("amountCredited", donation.amount)
    donation.phone_number = data.get("numero_tel") or data.get("customerID", "")
    donation.operator = data.get("operator", "")
    donation.raw_response = data

    # Mettre a jour le statut
    if webhook_status == "SUCCESS" or status_code == 200:
        donation.status = "completed"
    elif webhook_status == "FAILED" or webhook_status == "CANCELLED":
        donation.status = "failed"

    donation.save()

    return Response({"success": True, "message": "Webhook traite avec succès"})


@api_view(["GET"])
def donation_types_public(request):
    """Endpoint public pour obtenir les types de dons"""
    types = DonationType.objects.filter(is_active=True).order_by("order")
    serializer = DonationTypeSerializer(types, many=True)
    return Response({"success": True, "donation_types": serializer.data})
