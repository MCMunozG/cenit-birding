import { Component, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { CommunityApiService } from "../../../core/api/community-api.service";
import { FeedPost } from "../../../shared/models/community.models";

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./community-feed.page.html",
})
/** Estado específico del feed; no es dueño de publicaciones ni reglas de moderación. */
export class CommunityFeedPageComponent {
  private readonly communityApi = inject(CommunityApiService);
  readonly feed = signal<FeedPost[]>([]);
  readonly communityError = signal(false);
  readonly seededPosts = [
    {
      initial: "A",
      author: "Andrea M.",
      time: "Hace 2 horas",
      title:
        "Esta mañana aprendí a quedarme quieta antes de buscar con los ojos. El canto llegó primero.",
      reference: "Observación compartida",
    },
    {
      initial: "J",
      author: "Julián R.",
      time: "Ayer",
      title:
        "¿Qué detalles usan para separar especies similares cuando la luz está baja?",
      reference: "Consulta de identificación",
    },
  ];

  constructor() {
    this.communityApi.feed().subscribe({
      next: ({ data }) => {
        this.feed.set(data);
        this.communityError.set(false);
      },
      error: () => this.communityError.set(true),
    });
  }
}
