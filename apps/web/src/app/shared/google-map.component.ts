import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
  inject,
} from "@angular/core";
import { GoogleMapsLoaderService } from "../core/google-maps-loader.service";
import { Sighting } from "./models/observation.models";

declare const google: any;

@Component({
  standalone: true,
  selector: "app-google-map",
  templateUrl: "./google-map.component.html",
})
/** Conecta el SDK imperativo de Google Maps con inputs Angular y reglas de ubicación pública/privada. */
export class GoogleMapComponent implements AfterViewInit, OnChanges {
  @Input({ required: true }) apiKey = "";
  @Input() mode: "browse" | "picker" = "browse";
  @Input() latitude = 4.711;
  @Input() longitude = -74.072;
  @Input() sightings: Sighting[] = [];
  @Output() locationChange = new EventEmitter<{
    latitude: number;
    longitude: number;
  }>();
  @Output() mapError = new EventEmitter<string>();
  @ViewChild("map") mapElement?: ElementRef<HTMLElement>;
  private readonly loader = inject(GoogleMapsLoaderService);
  private map?: any;
  private selectedMarker?: any;
  private publicMarkers: any[] = [];

  /** Crea el mapa sólo después de que exista su elemento anfitrión. */
  ngAfterViewInit(): void {
    this.initialize();
  }
  /** Reconcilia cambios de inputs sin recrear un mapa ya inicializado. */
  ngOnChanges(): void {
    if (this.map) {
      this.placeSelectedMarker();
      this.renderPublicMarkers();
    } else if (this.mapElement && this.apiKey) this.initialize();
  }

  /** Carga el SDK externo y configura exploración o selección de ubicación privada. */
  initialize(): void {
    this.loader
      .load(this.apiKey)
      .then(() => {
        if (!this.mapElement) return;
        const center = {
          lat: Number(this.latitude),
          lng: Number(this.longitude),
        };
        this.map = new google.maps.Map(this.mapElement.nativeElement, {
          center,
          zoom: this.mode === "picker" ? 13 : 10,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        if (this.mode === "picker") {
          this.placeSelectedMarker();
          this.map.addListener("click", (event: any) =>
            this.select(event.latLng.lat(), event.latLng.lng()),
          );
        }
        this.renderPublicMarkers();
      })
      .catch((error: Error) => this.mapError.emit(error.message));
  }

  /** Redondea y emite al formulario dueño un punto privado elegido por la persona. */
  private select(latitude: number, longitude: number): void {
    this.latitude = Number(latitude.toFixed(7));
    this.longitude = Number(longitude.toFixed(7));
    this.placeSelectedMarker();
    this.locationChange.emit({
      latitude: this.latitude,
      longitude: this.longitude,
    });
  }

  /** Crea o reposiciona el marcador arrastrable usado sólo en modo selector. */
  private placeSelectedMarker(): void {
    if (this.mode !== "picker" || !this.map) return;
    const position = {
      lat: Number(this.latitude),
      lng: Number(this.longitude),
    };
    if (!this.selectedMarker) {
      this.selectedMarker = new google.maps.Marker({
        position,
        map: this.map,
        draggable: true,
        title: "Ubicación privada del avistamiento",
      });
      this.selectedMarker.addListener("dragend", (event: any) =>
        this.select(event.latLng.lat(), event.latLng.lng()),
      );
    } else this.selectedMarker.setPosition(position);
  }

  /** Reemplaza marcadores por las coordenadas públicas suministradas por Observation. */
  private renderPublicMarkers(): void {
    if (!this.map || this.mode !== "browse") return;
    this.publicMarkers.forEach((marker) => marker.setMap(null));
    this.publicMarkers = this.sightings
      .filter((s) => s.latitude != null && s.longitude != null)
      .map((s) => {
        const marker = new google.maps.Marker({
          position: { lat: Number(s.latitude), lng: Number(s.longitude) },
          map: this.map,
          title: "Avistamiento público",
        });
        const info = new google.maps.InfoWindow({
          content:
            "<strong>Avistamiento público</strong><br>Estado: " +
            s.status +
            "<br>Individuos: " +
            s.individuals,
        });
        marker.addListener("click", () =>
          info.open({ anchor: marker, map: this.map }),
        );
        return marker;
      });
  }
}
