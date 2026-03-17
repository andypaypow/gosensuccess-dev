// Génération d'un identifiant d'appareil persistant basé sur fingerprint

export class DeviceIdentifier {
  private readonly STORAGE_KEY = 'gs_device_uuid';
  private readonly COOKIE_KEY = 'gs_device_id';
  private readonly COOKIE_DAYS = 365;

  getDeviceId(): string {
    // Try multiple storage methods in order
    let deviceId = this.getFromLocalStorage();
    if (deviceId) return deviceId;

    deviceId = this.getFromCookie();
    if (deviceId) return deviceId;

    deviceId = this.getFromSessionStorage();
    if (deviceId) return deviceId;

    // Generate new UUID based on fingerprint
    deviceId = this.generateDeviceUUID();
    
    // Store in all locations
    this.setToAll(deviceId);
    
    return deviceId;
  }

  private getFromLocalStorage(): string | null {
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private getFromSessionStorage(): string | null {
    try {
      return sessionStorage.getItem(this.STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private getFromCookie(): string | null {
    const name = this.COOKIE_KEY + '=';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name)) {
        return cookie.substring(name.length);
      }
    }
    return null;
  }

  private setToAll(deviceId: string): void {
    // Store in localStorage
    try {
      localStorage.setItem(this.STORAGE_KEY, deviceId);
    } catch (e) {
      console.warn('localStorage not available:', e);
    }

    // Store in sessionStorage
    try {
      sessionStorage.setItem(this.STORAGE_KEY, deviceId);
    } catch (e) {
      console.warn('sessionStorage not available:', e);
    }

    // Store in cookie
    this.setCookie(deviceId);
  }

  private setCookie(value: string): void {
    const date = new Date();
    date.setTime(date.getTime() + (this.COOKIE_DAYS * 24 * 60 * 60 * 1000));
    const expires = '; expires=' + date.toUTCString();
    
    try {
      document.cookie = this.COOKIE_KEY + '=' + value + expires + '; path=/; SameSite=Lax';
    } catch (e) {
      console.warn('Cookie not available:', e);
    }
  }

  private generateDeviceUUID(): string {
    // Generate UUID v4
    const fingerprint = this.getFingerprint();
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    
    // Combine fingerprint with timestamp and random
    const combined = fingerprint + '-' + timestamp + '-' + random;
    
    // Convert to UUID-like format
    return 'uuid-' + combined.substring(0, 32);
  }

  private getFingerprint(): string {
    // Create a simple fingerprint from browser characteristics
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage,
      navigator.platform,
      navigator.hardwareConcurrency || 0
    ];

    // Simple hash function
    let hash = 0;
    const str = components.join('|');
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash).toString(36);
  }

  getDeviceInfo(): object {
    return {
      deviceId: this.getDeviceId(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen: screen.width + 'x' + screen.height,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    };
  }
}

export const deviceIdentifier = new DeviceIdentifier();
