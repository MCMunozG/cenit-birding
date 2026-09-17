import { Injectable, signal } from "@angular/core";
import { SessionResponse, SessionUser } from "../shared/models/accounts.models";

export type { SessionUser } from "../shared/models/accounts.models";

/**
 * Conserva la sesión de corta duración de la SPA en sessionStorage y refleja sólo el resumen de usuario como signal.
 * Es una decisión de transporte del MVP; un BFF futuro debe reemplazarla con cookies HttpOnly.
 */
@Injectable({ providedIn: "root" })
export class SessionService {
  readonly user = signal<SessionUser | null>(this.readUser());

  /** Persiste ambos tokens juntos para que la UI no observe una sesión iniciada parcialmente. */
  start(session: SessionResponse): void {
    sessionStorage.setItem("cenit_access_token", session.access_token);
    sessionStorage.setItem("cenit_refresh_token", session.refresh_token);
    sessionStorage.setItem("cenit_user", JSON.stringify(session.user));
    this.user.set(session.user);
  }

  /** Limpia el estado local; revocar refresh tokens en servidor sigue siendo responsabilidad de Accounts. */
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
