import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { CatalogApiService } from "../../../core/api/catalog-api.service";
import { Species } from "../../../shared/models/catalog.models";
import { seedSpecies } from "../../shared/seed-species";

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: "./species-list.page.html",
})
/** El estado de búsqueda de Catalog permanece local a la ruta de lista de especies. */
export class SpeciesListPageComponent {
  private readonly catalogApi = inject(CatalogApiService);
  readonly species = signal<Species[]>(seedSpecies);
  readonly catalogError = signal(false);
  searchText = "";

  constructor() {
    this.loadSpecies();
  }

  /** Carga Catalog y conserva un respaldo visible de desarrollo cuando el servicio no responde. */
  loadSpecies(query = ""): void {
    this.catalogApi.species(query).subscribe({
      next: ({ data }) => {
        this.species.set(data);
        this.catalogError.set(false);
      },
      error: () => {
        this.species.set(
          seedSpecies.filter((species) =>
            `${species.common_name} ${species.scientific_name}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          ),
        );
        this.catalogError.set(true);
      },
    });
  }
}
