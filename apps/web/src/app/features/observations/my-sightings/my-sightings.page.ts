import { Component, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ObservationsApiService } from "../../../core/api/observations-api.service";
import { SessionService } from "../../../core/session.service";
import { Sighting } from "../../../shared/models/observation.models";

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./my-sightings.page.html",
})
export class MySightingsPageComponent {
  private readonly observationsApi = inject(ObservationsApiService);
  private readonly session = inject(SessionService);
  readonly mySightings = signal<Sighting[]>([]);

  constructor() {
    if (this.hasSession())
      this.observationsApi
        .mine()
        .subscribe({ next: ({ data }) => this.mySightings.set(data) });
  }
  hasSession(): boolean {
    return this.session.hasToken();
  }
}
