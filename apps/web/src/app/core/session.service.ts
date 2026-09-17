import { Injectable, signal } from '@angular/core';
import { SessionResponse } from './api.service';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  readonly user = signal<SessionUser | null>(this.readUser());

  start(session: SessionResponse): void {
    sessionStorage.setItem('cenit_access_token', session.access_token);
    sessionStorage.setItem('cenit_refresh_token', session.refresh_token);
    sessionStorage.setItem('cenit_user', JSON.stringify(session.user));
    this.user.set(session.user);
  }

  end(): void {
    sessionStorage.removeItem('cenit_access_token');
    sessionStorage.removeItem('cenit_refresh_token');
    sessionStorage.removeItem('cenit_user');
    this.user.set(null);
  }

  hasToken(): boolean {
    return !!sessionStorage.getItem('cenit_access_token');
  }

  private readUser(): SessionUser | null {
    try {
      const raw = sessionStorage.getItem('cenit_user');
      return raw ? JSON.parse(raw) as SessionUser : null;
    } catch {
      return null;
    }
  }
}
