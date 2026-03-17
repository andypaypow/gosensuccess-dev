const API_URL = 'http://72.62.181.239:8086/api';
import { deviceIdentifier } from './deviceIdUtils';

export interface UserInfo {
  id: number;
  phone: string;
  max_devices: number;
  license?: any;
}

export interface AuthResponse {
  success: boolean;
  session_token?: string;
  user?: UserInfo;
  message?: string;
  valid?: boolean;
  clear_local?: boolean;
}

export class AuthService {
  private readonly SESSION_KEY = 'gs_session_token';
  private readonly USER_KEY = 'gs_user_info';
  private sessionToken: string | null = null;
  private userInfo: UserInfo | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      this.sessionToken = localStorage.getItem(this.SESSION_KEY);
      const userStr = localStorage.getItem(this.USER_KEY);
      if (userStr) {
        this.userInfo = JSON.parse(userStr);
      }
    } catch (e) {
      console.warn('Failed to load from storage:', e);
    }
  }

  private saveToStorage(): void {
    try {
      if (this.sessionToken) {
        localStorage.setItem(this.SESSION_KEY, this.sessionToken);
        if (this.userInfo) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(this.userInfo));
        }
      }
    } catch (e) {
      console.warn('Failed to save to storage:', e);
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.sessionToken = null;
    this.userInfo = null;
  }

  async register(phone: string): Promise<AuthResponse> {
    try {
      const deviceInfo = deviceIdentifier.getDeviceInfo();
      
      const response = await fetch(API_URL + '/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, device_info: deviceInfo })
      });

      const result: AuthResponse = await response.json();

      if (result.success && result.session_token && result.user) {
        this.sessionToken = result.session_token;
        this.userInfo = result.user;
        this.saveToStorage();
      }

      return result;
    } catch (error) {
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  }

  async login(phone: string): Promise<AuthResponse> {
    try {
      const response = await fetch(API_URL + '/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const result: AuthResponse = await response.json();

      if (result.success && result.session_token && result.user) {
        this.sessionToken = result.session_token;
        this.userInfo = result.user;
        this.saveToStorage();
      }

      return result;
    } catch (error) {
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  }

  async verifySession(): Promise<boolean> {
    if (!this.sessionToken) {
      return false;
    }

    try {
      const response = await fetch(API_URL + '/auth/verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_token: this.sessionToken,
          device_info: deviceIdentifier.getDeviceInfo()
        })
      });

      const result: AuthResponse = await response.json();

      if (result.valid && result.user) {
        this.userInfo = result.user;
        this.saveToStorage();
        return true;
      }

      if (result.clear_local) {
        this.clearStorage();
      }

      return false;
    } catch (error) {
      console.warn('Session verification failed:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    if (!this.sessionToken) {
      this.clearStorage();
      return;
    }

    try {
      await fetch(API_URL + '/auth/logout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: this.sessionToken })
      });
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearStorage();
    }
  }

  isAuthenticated(): boolean {
    return !!this.sessionToken && !!this.userInfo;
  }

  getSessionToken(): string | null {
    return this.sessionToken;
  }

  getUserInfo(): UserInfo | null {
    return this.userInfo;
  }

  getPhone(): string {
    return this.userInfo?.phone || '';
  }
}

export const authService = new AuthService();
