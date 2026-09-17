import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({ standalone: true, templateUrl: "./planning.page.html" })
/** Muestra contenido de planificación reutilizable para lugares y rutas. */
export class PlanningPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly view = signal("places");
  readonly planningCards = [
    {
      icon: "⌖",
      meta: "HUMEDAL · 4,5 KM",
      title: "Humedal de la sabana",
      text: "Mira mejores momentos y especies registradas públicamente.",
    },
    {
      icon: "⌁",
      meta: "BOSQUE · FÁCIL",
      title: "Sendero del bosque alto",
      text: "Un recorrido corto para reconocer cantos y estratos.",
    },
    {
      icon: "◒",
      meta: "PARQUE · URBANO",
      title: "Mañana de parque",
      text: "Una ruta para comenzar a registrar aves cerca de casa.",
    },
  ];

  /** Lee la variante solicitada sin duplicar el componente ni su plantilla. */
  constructor() {
    this.route.data.subscribe((data) => this.view.set(data["view"]));
  }
}
