import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  CreateSightingCommand,
  Sighting,
} from "../../shared/models/observation.models";

/** Cliente de Observation. Nunca deriva ni almacena privacidad geográfica en el navegador. */
@Injectable({ providedIn: "root" })
export class ObservationsApiService {
  constructor(private readonly http: HttpClient) {}

  map(): Observable<{ data: Sighting[] }> {
    return this.http.get<{ data: Sighting[] }>(
      "/api/observations/v1/map/sightings",
    );
  }
  mine(): Observable<{ data: Sighting[] }> {
    return this.http.get<{ data: Sighting[] }>(
      "/api/observations/v1/sightings/mine",
    );
  }
  createSighting(command: CreateSightingCommand): Observable<Sighting> {
    return this.http.post<Sighting>("/api/observations/v1/sightings", command);
  }
}
