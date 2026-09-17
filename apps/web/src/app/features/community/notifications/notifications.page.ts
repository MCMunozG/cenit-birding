import { Component, inject, signal } from "@angular/core";
import { CommunityApiService } from "../../../core/api/community-api.service";
import { SessionService } from "../../../core/session.service";
import { Notification } from "../../../shared/models/community.models";

@Component({ standalone: true, templateUrl: "./notifications.page.html" })
/** Consulta notificaciones sólo cuando hay una identidad local autenticada. */
export class NotificationsPageComponent {
  private readonly communityApi = inject(CommunityApiService);
  private readonly session = inject(SessionService);
  readonly notifications = signal<Notification[]>([]);

  constructor() {
    if (this.hasSession())
      this.communityApi
        .notifications()
        .subscribe({ next: ({ data }) => this.notifications.set(data) });
  }
  /** Expone una comprobación de sesión para carga condicional y plantilla. */
  hasSession(): boolean {
    return this.session.hasToken();
  }
}
