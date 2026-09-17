import { Injectable, signal } from "@angular/core";
import { SessionResponse, SessionUser } from "../shared/models/accounts.models";

export type { SessionUser } from "../shared/models/accounts.models";

/**
 * Keeps the short-lived SPA session in sessionStorage and mirrors only the user summary as a signal.
 * This is an MVP transport decision; a future BFF must replace it with HttpOnly cookies.
 */
@Injectable({ providedIn: "root" })
export class SessionService {
  readonly user = signal<SessionUser | null>(this.readUser());

  /** Persists both tokens together so the UI cannot observe a partially started session. */
  start(session: SessionResponse): void {
    sessionStorage.setItem("cenit_access_token", session.access_token);
    sessionStorage.setItem("cenit_refresh_token", session.refresh_token);
    sessionStorage.setItem("cenit_user", JSON.stringify(session.user));
    this.user.set(session.user);
  }

  /** Clears local state; server-side refresh-token revocation remains an Accounts API concern. */
  end(): void {
    sessionStorage.removeItem("cenit_access_token");
    sessionStorage.removeItem("cenit_refresh_token");
    sessionStorage.removeItem("cenit_user");
    this.user.set(null);
  }

  hasToken(): boolean {
    return !!sessionStorage.getItem("cenit_access_token");
  }

  private readUser(): SessionUser | null {
    try {
      const raw = sessionStorage.getItem("cenit_user");
      return raw ? (JSON.parse(raw) as SessionUser) : null;
    } catch {
      return null;
    }
  }
}
