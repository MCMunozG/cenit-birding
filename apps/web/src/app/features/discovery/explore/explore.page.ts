import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { CatalogApiService } from "../../../core/api/catalog-api.service";

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: "./explore.page.html",
})
/** Pantalla de descubrimiento que delega la búsqueda editorial en Catalog. */
export class ExplorePageComponent {
  private readonly catalogApi = inject(CatalogApiService);
  searchText = "";
  readonly highlights = [
    {
      icon: "◒",
      label: "OBSERVA",
      title: "Especies del día",
      text: "Repasa fichas y recomendaciones antes de salir.",
      link: "/especies",
    },
    {
      icon: "⌖",
      label: "EXPLORA",
      title: "Mapa con cuidado",
      text: "Consulta patrones públicos sin comprometer ubicaciones.",
      link: "/mapa",
    },
    {
      icon: "↗",
      label: "COMPARTE",
      title: "Aprende en comunidad",
      text: "Convierte una salida en una conversación útil.",
      link: "/comunidad",
    },
  ];

  /** Dispara una consulta de especies desde el texto actual; la lista vive en su propia ruta. */
  loadSpecies(query = this.searchText): void {
    this.catalogApi.species(query).subscribe();
  }
}
