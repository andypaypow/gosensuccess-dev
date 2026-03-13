const API_URL = 'http://72.62.181.239:8086/api';

export enum LicenseStatus {
  FIRST_LAUNCH = 'first_launch',
  TRIAL = 'trial',
  EXPIRED = 'expired',
  ACTIVATED = 'activated',
  REVOKED = 'revoked'
}

export class LicenseManager {
  private readonly STORAGE_KEY = 'gosensuccess_license';
  private deviceId: string;
  private data: any = null;

  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
    this.data = this.loadStoredData();
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('gs_device_id');
    if (!deviceId) {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 15);
      deviceId = 'android-' + timestamp + '-' + random;
      localStorage.setItem('gs_device_id', deviceId);
    }
    return deviceId;
  }

  private loadStoredData(): any {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private saveData(data: any): void {
    const signature = this.generateSignature(data);
    const dataToStore = { ...data, _sig: signature };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToStore));
    this.data = data;
  }

  private generateSignature(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private verifySignature(data: any): boolean {
    if (!data._sig) return false;
    const { _sig, ...dataWithoutSig } = data;
    return this.generateSignature(dataWithoutSig) === _sig;
  }

  getStatus(): string {
    if (!this.data) {
      return LicenseStatus.FIRST_LAUNCH;
    }

    const stored = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    if (!this.verifySignature(stored)) {
      localStorage.removeItem(this.STORAGE_KEY);
      return LicenseStatus.FIRST_LAUNCH;
    }

    const now = new Date();
    const expiresAt = this.data.expiresAt ? new Date(this.data.expiresAt) : null;

    if (this.data.status === LicenseStatus.TRIAL) {
      if (expiresAt && now > expiresAt) {
        return LicenseStatus.EXPIRED;
      }
      return LicenseStatus.TRIAL;
    }

    if (this.data.status === LicenseStatus.ACTIVATED) {
      if (expiresAt && now > expiresAt) {
        return LicenseStatus.EXPIRED;
      }
      return LicenseStatus.ACTIVATED;
    }

    if (this.data.status === LicenseStatus.REVOKED) {
      return LicenseStatus.REVOKED;
    }

    return this.data.status;
  }

  startTrial(period: '1h' | '1d' | '1w'): void {
    const now = new Date();
    const expiresAt = this.calculateExpiration(period, now);

    const data = {
      deviceId: this.deviceId,
      status: LicenseStatus.TRIAL,
      trialPeriod: period,
      startedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    this.saveData(data);
  }

  private calculateExpiration(period: string, from: Date): Date {
    const result = new Date(from);
    
    if (period === '1h') {
      result.setHours(result.getHours() + 1);
    } else if (period === '1d') {
      result.setDate(result.getDate() + 1);
    } else if (period === '1w') {
      result.setDate(result.getDate() + 7);
    }
    
    return result;
  }

  async activateLicense(key: string, email: string): Promise<{ success: boolean; message: string }> {
    if (!await this.isOnline()) {
      return {
        success: false,
        message: 'Connexion internet requise pour l activation. Veuillez vérifier votre connexion.'
      };
    }

    try {
      const response = await fetch(API_URL + '/licenses/activate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          email,
          device_id: this.deviceId
        })
      });

      const result = await response.json();

      if (result.success) {
        const data = {
          deviceId: this.deviceId,
          status: LicenseStatus.ACTIVATED,
          key: result.license.key,
          email: result.license.email,
          activatedAt: result.license.activated_at || new Date().toISOString(),
          expiresAt: result.license.expires_at,
          lastChecked: new Date().toISOString()
        };

        this.saveData(data);

        return {
          success: true,
          message: 'Licence activée avec succès !'
        };
      } else {
        return {
          success: false,
          message: result.message || 'Clé invalide'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erreur de connexion au serveur. Veuillez réessayer.'
      };
    }
  }

  canUseApp(): boolean {
    const status = this.getStatus();
    return status === LicenseStatus.TRIAL || status === LicenseStatus.ACTIVATED;
  }

  getRemainingTime(): string {
    if (!this.data || !this.data.expiresAt) {
      return '';
    }

    const now = new Date();
    const expires = new Date(this.data.expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) {
      return 'Expiré';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return days + ' jour(s)';
    } else if (hours > 0) {
      return hours + 'h ' + minutes + 'min';
    } else {
      return minutes + ' minutes';
    }
  }

  getData(): any {
    return this.data;
  }

  private async isOnline(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine;
    }
    return true;
  }
}

export const licenseManager = new LicenseManager();
