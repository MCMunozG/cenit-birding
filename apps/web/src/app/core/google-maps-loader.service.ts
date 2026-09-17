import { Injectable } from "@angular/core";

declare const google: any;

/** Carga un solo script de Google Maps para que páginas simultáneas no agreguen duplicados. */
@Injectable({ providedIn: "root" })
export class GoogleMapsLoaderService {
  private loading?: Promise<void>;
  private loadedKey?: string;

  /** La clave la aporta la sesión actual del navegador y este servicio nunca la persiste. */
  load(apiKey: string): Promise<void> {
    if (!apiKey)
      return Promise.reject(new Error("GOOGLE_MAPS_API_KEY_MISSING"));
    if (typeof google !== "undefined" && this.loadedKey === apiKey)
      return Promise.resolve();
    if (this.loading) return this.loading;

    this.loading = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=" +
        encodeURIComponent(apiKey) +
        "&v=weekly";
      script.async = true;
      script.onload = () => {
        this.loadedKey = apiKey;
        resolve();
      };
      script.onerror = () => reject(new Error("GOOGLE_MAPS_LOAD_FAILED"));
      document.head.appendChild(script);
    }).finally(() => {
      this.loading = undefined;
    });
    return this.loading;
  }
}
