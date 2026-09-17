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

  ngAfterViewInit(): void {
    this.initialize();
  }
  ngOnChanges(): void {
    if (this.map) {
      this.placeSelectedMarker();
      this.renderPublicMarkers();
    } else if (this.mapElement && this.apiKey) this.initialize();
  }

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

  private select(latitude: number, longitude: number): void {
    this.latitude = Number(latitude.toFixed(7));
    this.longitude = Number(longitude.toFixed(7));
    this.placeSelectedMarker();
    this.locationChange.emit({
      latitude: this.latitude,
      longitude: this.longitude,
    });
  }

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
