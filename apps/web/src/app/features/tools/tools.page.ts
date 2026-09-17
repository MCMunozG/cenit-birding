import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({ standalone: true, templateUrl: "./tools.page.html" })
export class ToolsPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly view = signal("collections");
  readonly title = signal("Mis colecciones");

  constructor() {
    this.route.data.subscribe((data) => {
      this.view.set(data["view"]);
      this.title.set(data["title"]);
    });
  }
}
