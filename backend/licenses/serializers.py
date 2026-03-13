from rest_framework import serializers
from .models import License, LicenseLog


class LicenseSerializer(serializers.ModelSerializer):
    """Serializer pour les licences"""
    
    trial_period_display = serializers.CharField(source='get_trial_period_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_expired = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = License
        fields = [
            'id', 'key', 'email', 'device_id', 'status', 'status_display',
            'trial_period', 'trial_period_display', 'created_at', 
            'activated_at', 'expires_at', 'last_validated',
            'max_activations', 'activation_count', 'app_version', 'notes',
            'is_expired', 'days_remaining'
        ]
        read_only_fields = ['key', 'created_at', 'last_validated']
    
    def get_is_expired(self, obj):
        return obj.status == 'expired'
    
    def get_days_remaining(self, obj):
        if obj.expires_at:
            from datetime import datetime
            delta = obj.expires_at - datetime.now(obj.expires_at.tzinfo)
            return max(0, delta.days)
        return None


class LicenseCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une licence"""
    
    class Meta:
        model = License
        fields = ['email', 'trial_period', 'max_activations', 'app_version', 'notes']
    
    def create(self, validated_data):
        # Générer une nouvelle clé unique
        from .models import generate_license_key
        validated_data['key'] = generate_license_key()
        validated_data['status'] = 'trial'
        return super().create(validated_data)


class ValidateLicenseSerializer(serializers.Serializer):
    """Serializer pour valider une licence"""
    
    key = serializers.CharField(max_length=19)
    device_id = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    
    def validate(self, data):
        key = data.get('key')
        email = data.get('email')
        
        try:
            license = License.objects.get(key=key, email=email)
        except License.DoesNotExist:
            raise serializers.ValidationError("Licence invalide")
        
        data['license'] = license
        return data


class LicenseLogSerializer(serializers.ModelSerializer):
    """Serializer pour les journaux"""
    
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = LicenseLog
        fields = ['id', 'action', 'action_display', 'device_id', 'ip_address', 'timestamp', 'details']
        read_only_fields = ['timestamp']
