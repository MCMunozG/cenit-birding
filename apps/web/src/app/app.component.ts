import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { SessionService } from "./core/session.service";

@Component({
  standalone: true,
  selector: "app-root",
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="site-header sticky-top">
      <nav class="navbar navbar-expand-lg navbar-light container py-3">
        <a class="navbar-brand d-flex align-items-center gap-2" routerLink="/">
          <span class="brand-mark">⌁</span><span>Cénit <b>Birding</b></span>
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-label="Abrir navegación"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div id="mainNav" class="collapse navbar-collapse">
          <div class="navbar-nav mx-lg-auto gap-lg-1">
            <a class="nav-link" routerLink="/explorar" routerLinkActive="active"
              >Explorar</a
            >
            <a class="nav-link" routerLink="/especies" routerLinkActive="active"
              >Especies</a
            >
            <a class="nav-link" routerLink="/mapa" routerLinkActive="active"
              >Mapa</a
            >
            <a class="nav-link" routerLink="/lugares" routerLinkActive="active"
              >Lugares</a
            >
            <a
              class="nav-link"
              routerLink="/comunidad"
              routerLinkActive="active"
              >Comunidad</a
            >
          </div>
          <div class="d-flex gap-2 align-items-center mt-3 mt-lg-0">
            @if (session.user(); as user) {
              <a class="user-chip text-decoration-none" routerLink="/perfil"
                ><span>{{ user.name.slice(0, 1).toUpperCase() }}</span
                >{{ user.name }}</a
              >
              <button
                class="btn btn-link text-decoration-none text-dark p-0"
                (click)="logout()"
              >
                Salir
              </button>
            } @else {
              <a
                class="btn btn-link text-decoration-none text-dark"
                routerLink="/ingresar"
                >Ingresar</a
              >
            }
            <a class="btn btn-forest" routerLink="/avistamientos/nuevo"
              >+ Registrar</a
            >
          </div>
        </div>
      </nav>
    </header>
    <main><router-outlet /></main>
    <footer class="site-footer mt-5">
      <div
        class="container py-4 d-flex flex-column flex-md-row justify-content-between gap-2"
      >
        <span
          ><b>Cénit Birding</b> · ciencia ciudadana con respeto por la
          fauna.</span
        >
        <span class="text-muted"
          >Las fichas se actualizan con criterios de observación
          responsable.</span
        >
      </div>
    </footer>
  `,
})
export class AppComponent {
  readonly session = inject(SessionService);

  logout(): void {
    this.session.end();
  }
}
