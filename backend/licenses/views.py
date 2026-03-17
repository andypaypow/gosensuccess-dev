from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import License, LicenseLog, Payment
from .serializers import (
    LicenseSerializer, LicenseCreateSerializer, 
    ValidateLicenseSerializer, LicenseLogSerializer
)
import json
from datetime import datetime


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class LicenseViewSet(viewsets.ModelViewSet):
    queryset = License.objects.all()
    serializer_class = LicenseSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return LicenseCreateSerializer
        return LicenseSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        license = serializer.save()
        LicenseLog.objects.create(
            license=license,
            action='generated',
            ip_address=get_client_ip(request),
            details=f"Licence creee pour {license.email}"
        )
        return Response(LicenseSerializer(license).data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def validate(self, request):
        serializer = ValidateLicenseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        license_obj = serializer.validated_data['license']
        device_id = serializer.validated_data['device_id']
        is_valid, message = license_obj.is_valid()
        if is_valid:
            LicenseLog.objects.create(
                license=license_obj,
                action='validated',
                device_id=device_id,
                ip_address=get_client_ip(request)
            )
            license_obj.last_validated = timezone.now()
            license_obj.save()
            return Response({'valid': True, 'message': message, 'license': LicenseSerializer(license_obj).data})
        else:
            return Response({'valid': False, 'message': message}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response({
            'total': License.objects.count(),
            'active': License.objects.filter(status='active').count(),
            'expired': License.objects.filter(status='expired').count(),
            'trial': License.objects.filter(status='trial').count(),
            'revoked': License.objects.filter(status='revoked').count()
        })


class LicenseLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LicenseLog.objects.all()
    serializer_class = LicenseLogSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        license_id = self.request.query_params.get('license')
        if license_id:
            queryset = queryset.filter(license_id=license_id)
        return queryset


@csrf_exempt
@require_http_methods(['POST'])
def getsumb_webhook(request):
    try:
        data = json.loads(request.body)
        merchant_ref_id = data.get('merchantReferenceId')
        transaction_id = data.get('transactionId')
        status_code = data.get('code')
        amount = data.get('amount')
        numero_tel = data.get('customerID') or data.get('numero_tel', '')
        
        payment, created = Payment.objects.get_or_create(
            transaction_id=transaction_id,
            defaults={
                'merchant_reference_id': merchant_ref_id,
                'reference': data.get('reference', ''),
                'amount': amount,
                'fees': data.get('fees'),
                'total_amount': data.get('totalAmount'),
                'amount_credited': data.get('amountCredited'),
                'customer_id': data.get('customerID', ''),
                'numero_tel': numero_tel,
                'operator': data.get('operator', ''),
                'account_operation_code': data.get('accountOperationCode', ''),
                'status': 'success' if status_code == 200 else 'failed',
                'code': status_code,
                'raw_data': data,
                'timestamp': datetime.fromisoformat(data.get('timestamp', datetime.now().isoformat()))
            }
        )
        
        if not created:
            payment.status = 'success' if status_code == 200 else 'failed'
            payment.code = status_code
            payment.raw_data = data
            payment.save()
        
        if status_code == 200 and payment.status == 'success':
            license_obj = payment.create_license()
            return JsonResponse({'success': True, 'message': 'Paiement reussi', 'license_key': license_obj.key if license_obj else None}, status=200)
        else:
            return JsonResponse({'success': False, 'message': f'Paiement echoue. Code: {status_code}'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_license_by_phone(request):
    phone_number = request.GET.get('phone', '').strip()
    device_id = request.GET.get('device_id', '').strip()
    
    if not phone_number:
        return JsonResponse({'success': False, 'message': 'Numero requis'}, status=400)
    
    try:
        payment = Payment.objects.filter(numero_tel=phone_number, status='success', code=200).first()
        if not payment:
            return JsonResponse({'success': False, 'message': 'Aucune licence trouvee'}, status=404)
        
        if payment.license:
            license_obj = payment.license
            if device_id:
                license_obj.device_id = device_id
                license_obj.save()
            return JsonResponse({'success': True, 'license': LicenseSerializer(license_obj).data, 'message': 'Licence trouvee'})
        else:
            return JsonResponse({'success': False, 'message': 'Paiement sans licence'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)


from django.views.decorators.csrf import csrf_exempt
from .serializers import LicenseSerializer
import secrets


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def user_register(request):
    """Inscription d'un nouvel utilisateur avec numéro de téléphone"""
    phone = request.data.get('phone', '').strip()
    device_info = request.data.get('device_info', {})
    
    if not phone:
        return JsonResponse({'success': False, 'message': 'Numéro de téléphone requis'}, status=400)
    
    try:
        # Check if user already exists
        from .models import User, License
        user, created = User.objects.get_or_create(
            phone=phone,
            defaults={'is_active': True, 'max_devices': 1}
        )
        
        # Generate session token
        session_token = user.generate_session_token()
        
        # Create license if not exists
        if not user.license:
            license = License.objects.create(
                email=f'{phone}@user.local',
                status='trial',
                trial_period='1d'
            )
            user.license = license
            user.save()
        
        return JsonResponse({
            'success': True,
            'session_token': session_token,
            'user': {
                'id': user.id,
                'phone': user.phone,
                'max_devices': user.max_devices,
                'license': LicenseSerializer(user.license).data if user.license else None
            },
            'message': 'Inscription réussie'
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    """Connexion d'un utilisateur avec numéro de téléphone"""
    phone = request.data.get('phone', '').strip()
    
    if not phone:
        return JsonResponse({'success': False, 'message': 'Numéro de téléphone requis'}, status=400)
    
    try:
        from .models import User, License
        try:
            user = User.objects.get(phone=phone, is_active=True)
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Utilisateur introuvable'}, status=404)
        
        if not user.is_active:
            return JsonResponse({'success': False, 'message': 'Compte désactivé'}, status=403)
        
        # Generate new session
        session_token = user.generate_session_token()
        
        return JsonResponse({
            'success': True,
            'session_token': session_token,
            'user': {
                'id': user.id,
                'phone': user.phone,
                'max_devices': user.max_devices,
                'license': LicenseSerializer(user.license).data if user.license else None
            },
            'message': 'Connexion réussie'
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def user_verify_session(request):
    """Vérifie la validité d'une session"""
    session_token = request.data.get('session_token', '').strip()
    device_info = request.data.get('device_info', {})
    
    if not session_token:
        return JsonResponse({'valid': False, 'message': 'Token requis'}, status=400)
    
    try:
        from .models import User, License
        try:
            user = User.objects.get(session_token=session_token, is_active=True)
        except User.DoesNotExist:
            return JsonResponse({'valid': False, 'message': 'Session invalide', 'clear_local': True}, status=401)
        
        if not user.is_session_valid():
            user.logout()
            return JsonResponse({'valid': False, 'message': 'Session expirée', 'clear_local': True}, status=401)
        
        from .serializers import LicenseSerializer
        return JsonResponse({
            'valid': True,
            'user': {
                'id': user.id,
                'phone': user.phone,
                'max_devices': user.max_devices,
                'license': LicenseSerializer(user.license).data if user.license else None
            },
            'message': 'Session valide'
        })
        
    except Exception as e:
        return JsonResponse({'valid': False, 'message': str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def user_logout(request):
    """Déconnecte un utilisateur"""
    session_token = request.data.get('session_token', '').strip()
    
    if not session_token:
        return JsonResponse({'success': False, 'message': 'Token requis'}, status=400)
    
    try:
        from .models import User
        try:
            user = User.objects.get(session_token=session_token)
            user.logout()
            return JsonResponse({'success': True, 'message': 'Déconnexion réussie', 'clear_local': True})
        except User.DoesNotExist:
            return JsonResponse({'success': True, 'message': 'Déconnexion réussie', 'clear_local': True})
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)
