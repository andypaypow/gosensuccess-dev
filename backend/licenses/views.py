from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import License, LicenseLog
from .serializers import (
    LicenseSerializer, LicenseCreateSerializer, 
    ValidateLicenseSerializer, LicenseLogSerializer
)


def get_client_ip(request):
    """Récupère l'IP du client"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class LicenseViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les licences"""
    
    queryset = License.objects.all()
    serializer_class = LicenseSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return LicenseCreateSerializer
        return LicenseSerializer
    
    def create(self, request, *args, **kwargs):
        """Créer une nouvelle licence"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        license = serializer.save()
        
        # Logger la création
        LicenseLog.objects.create(
            license=license,
            action='generated',
            ip_address=get_client_ip(request),
            details=f"Licence créée pour {license.email}"
        )
        
        return Response(
            LicenseSerializer(license).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['post'])
    def validate(self, request):
        """Valide une licence"""
        serializer = ValidateLicenseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        license_obj = serializer.validated_data['license']
        device_id = serializer.validated_data['device_id']
        
        # Vérifier la validité
        is_valid, message = license_obj.is_valid()
        
        if is_valid:
            # Logger la validation
            LicenseLog.objects.create(
                license=license_obj,
                action='validated',
                device_id=device_id,
                ip_address=get_client_ip(request)
            )
            license_obj.last_validated = timezone.now()
            license_obj.save()
            
            return Response({
                'valid': True,
                'message': message,
                'license': LicenseSerializer(license_obj).data
            })
        else:
            # Logger l'échec
            LicenseLog.objects.create(
                license=license_obj,
                action='failed',
                device_id=device_id,
                ip_address=get_client_ip(request),
                details=message
            )
            
            return Response({
                'valid': False,
                'message': message
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def activate(self, request):
        """Active une licence"""
        serializer = ValidateLicenseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        license_obj = serializer.validated_data['license']
        device_id = serializer.validated_data['device_id']
        
        # Activer la licence
        success, message = license_obj.activate(device_id)
        
        if success:
            # Logger l'activation
            LicenseLog.objects.create(
                license=license_obj,
                action='activated',
                device_id=device_id,
                ip_address=get_client_ip(request)
            )
            
            return Response({
                'success': True,
                'message': message,
                'license': LicenseSerializer(license_obj).data
            })
        else:
            return Response({
                'success': False,
                'message': message
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        """Révoque une licence"""
        license_obj = self.get_object()
        license_obj.status = 'revoked'
        license_obj.save()
        
        # Logger la révocation
        LicenseLog.objects.create(
            license=license_obj,
            action='revoked',
            ip_address=get_client_ip(request),
            details=f"Licence révoquée par {request.user}"
        )
        
        return Response({
            'success': True,
            'message': 'Licence révoquée'
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiques des licences"""
        total = License.objects.count()
        active = License.objects.filter(status='active').count()
        expired = License.objects.filter(status='expired').count()
        trial = License.objects.filter(status='trial').count()
        revoked = License.objects.filter(status='revoked').count()
        
        return Response({
            'total': total,
            'active': active,
            'expired': expired,
            'trial': trial,
            'revoked': revoked
        })


class LicenseLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour voir les journaux"""
    
    queryset = LicenseLog.objects.all()
    serializer_class = LicenseLogSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        license_id = self.request.query_params.get('license')
        if license_id:
            queryset = queryset.filter(license_id=license_id)
        return queryset
