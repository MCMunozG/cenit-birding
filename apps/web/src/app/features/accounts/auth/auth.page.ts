import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AccountsApiService } from "../../../core/api/accounts-api.service";
import { SessionService } from "../../../core/session.service";

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: "./auth.page.html",
})
/** Owns login/registration form state and resumes the route captured by the guard. */
export class AuthPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly accountsApi = inject(AccountsApiService);
  private readonly session = inject(SessionService);
  readonly view = signal<"login" | "register">("login");
  readonly submitting = signal(false);
  readonly authMessage = signal("");
  auth = { name: "", email: "", password: "", password_confirmation: "" };

  constructor() {
    this.route.data.subscribe((data) => this.view.set(data["view"]));
  }

  submitAuth(valid: boolean | null): void {
    if (!valid) {
      this.authMessage.set(
        "Revisa los datos. La contraseña debe tener al menos 12 caracteres.",
      );
      return;
    }
    this.submitting.set(true);
    this.authMessage.set("");
    const request =
      this.view() === "login"
        ? this.accountsApi.login(this.auth.email, this.auth.password)
        : this.accountsApi.register(
            this.auth.name,
            this.auth.email,
            this.auth.password,
            this.auth.password_confirmation,
          );
    request.subscribe({
      next: (session) => {
        this.session.start(session);
        this.submitting.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get("returnUrl");
        this.router.navigateByUrl(
          returnUrl?.startsWith("/") ? returnUrl : "/perfil",
        );
      },
      error: () => {
        this.authMessage.set(
          "No fue posible completar la operación. Revisa tus datos y Accounts.",
        );
        this.submitting.set(false);
      },
    });
  }
}
