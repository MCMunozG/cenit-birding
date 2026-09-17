import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CatalogApiService } from "../../../core/api/catalog-api.service";
import { ObservationsApiService } from "../../../core/api/observations-api.service";
import { SessionService } from "../../../core/session.service";
import { GoogleMapComponent } from "../../../shared/google-map.component";
import { seedSpecies } from "../../shared/seed-species";

@Component({
  standalone: true,
  imports: [FormsModule, GoogleMapComponent],
  templateUrl: "./new-sighting.page.html",
})
/** Captures a private observation; Observation, not this page, decides its public projection. */
export class NewSightingPageComponent {
  private readonly catalogApi = inject(CatalogApiService);
  private readonly observationsApi = inject(ObservationsApiService);
  private readonly session = inject(SessionService);
  readonly species = signal(seedSpecies);
  readonly googleMapError = signal("");
  readonly googleMapsKey = signal(
    sessionStorage.getItem("cenit_google_maps_key") ?? "",
  );
  readonly submitting = signal(false);
  readonly formMessage = signal("");
  readonly formSuccess = signal(false);
  draft = {
    species_id: "",
    observed_at: this.nowForInput(),
    individuals: 1,
    latitude: 4.711,
    longitude: -74.072,
    region: "",
    behavior: "",
    notes: "",
    publish: false,
  };

  constructor() {
    this.catalogApi
      .species()
      .subscribe({ next: ({ data }) => this.species.set(data) });
  }

  submitSighting(valid: boolean | null): void {
    if (!valid) {
      this.formSuccess.set(false);
      this.formMessage.set(
        "Completa los campos obligatorios y verifica las coordenadas.",
      );
      return;
    }
    if (!this.session.hasToken()) {
      this.formSuccess.set(false);
      this.formMessage.set("Inicia sesión antes de guardar un avistamiento.");
      return;
    }
    this.submitting.set(true);
    this.observationsApi
      .createSighting({
        ...this.draft,
        observed_at: new Date(this.draft.observed_at).toISOString(),
      })
      .subscribe({
        next: () => {
          this.formSuccess.set(true);
          this.formMessage.set(
            "Avistamiento guardado. La privacidad se aplicó antes de publicar.",
          );
          this.submitting.set(false);
        },
        error: () => {
          this.formSuccess.set(false);
          this.formMessage.set(
            "No fue posible guardar. Verifica que los servicios estén iniciados.",
          );
          this.submitting.set(false);
        },
      });
  }

  setGoogleMapsKey(key: string): void {
    this.googleMapError.set("");
    this.googleMapsKey.set(key.trim());
    sessionStorage.setItem("cenit_google_maps_key", key.trim());
  }
  selectMapLocation(location: { latitude: number; longitude: number }): void {
    this.draft.latitude = location.latitude;
    this.draft.longitude = location.longitude;
  }
  private nowForInput(): string {
    return new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }
}
