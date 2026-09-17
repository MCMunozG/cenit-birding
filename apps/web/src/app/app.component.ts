import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { SessionService } from "./core/session.service";

@Component({
  standalone: true,
  selector: "app-root",
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: "./app.component.html",
})
export class AppComponent {
  readonly session = inject(SessionService);

  logout(): void {
    this.session.end();
  }
}
