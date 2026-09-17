import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Species } from "../../shared/models/catalog.models";

/** Read-only client for Catalog; editorial sensitivity is owned by the backend. */
@Injectable({ providedIn: "root" })
export class CatalogApiService {
  constructor(private readonly http: HttpClient) {}

  species(query = ""): Observable<{ data: Species[] }> {
    return this.http.get<{ data: Species[] }>("/api/catalog/v1/species", {
      params: query ? { q: query } : {},
    });
  }

  speciesById(id: string): Observable<Species> {
    return this.http.get<Species>(`/api/catalog/v1/species/${id}`);
  }
}
