import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CatalogApiService } from "../../../core/api/catalog-api.service";
import { ObservationsApiService } from "../../../core/api/observations-api.service";
import { GoogleMapComponent } from "../../../shared/google-map.component";
import { Sighting } from "../../../shared/models/observation.models";
import { seedSpecies } from "../../shared/seed-species";

@Component({
  standalone: true,
  imports: [FormsModule, GoogleMapComponent],
  templateUrl: "./map.page.html",
})
/** Displays only the sanitized map projection returned by Observation. */
export class MapPageComponent {
  private readonly catalogApi = inject(CatalogApiService);
  private readonly observationsApi = inject(ObservationsApiService);
  readonly species = signal(seedSpecies);
  readonly mapSightings = signal<Sighting[]>([]);
  readonly mapError = signal(false);
  readonly googleMapError = signal("");
  readonly googleMapsKey = signal(
    sessionStorage.getItem("cenit_google_maps_key") ?? "",
  );

  constructor() {
    this.catalogApi
      .species()
      .subscribe({ next: ({ data }) => this.species.set(data) });
    this.observationsApi.map().subscribe({
      next: ({ data }) => {
        this.mapSightings.set(data);
        this.mapError.set(false);
      },
      error: () => this.mapError.set(true),
    });
  }

  setGoogleMapsKey(key: string): void {
    this.googleMapError.set("");
    this.googleMapsKey.set(key.trim());
    sessionStorage.setItem("cenit_google_maps_key", key.trim());
  }
}
