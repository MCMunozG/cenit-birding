export interface Sighting {
  id: string;
  species_id?: string | null;
  observed_at: string;
  individuals: number;
  behavior?: string | null;
  status: string;
  sensitivity: string;
  /** Public coordinates only; private coordinates are intentionally absent from the SPA contract. */
  latitude?: number | null;
  longitude?: number | null;
  region?: string | null;
}

export interface CreateSightingCommand {
  species_id: string;
  observed_at: string;
  individuals: number;
  latitude: number;
  longitude: number;
  region: string;
  behavior: string;
  notes: string;
  publish: boolean;
}
