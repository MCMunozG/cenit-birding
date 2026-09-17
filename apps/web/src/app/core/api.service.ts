import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Species {
  id: string;
  common_name: string;
  scientific_name: string;
  sensitivity: 'EXACT' | 'APPROXIMATE' | 'HIDDEN';
  description?: string;
  habitat?: string;
  conservation_status?: string;
}

export interface Sighting {
  id: string;
  species_id?: string | null;
  observed_at: string;
  individuals: number;
  behavior?: string | null;
  status: string;
  sensitivity: string;
  latitude?: number | null;
  longitude?: number | null;
  region?: string | null;
}

export interface FeedPost {
  id: string;
  author_id: string;
  body?: string | null;
  reference_type: string;
  reference_id: string;
  created_at: string;
}

export interface SessionResponse {
  access_token: string;
  refresh_token: string;
  user: { id: string; name: string; email: string; role: string };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  bio?: string | null;
  general_location?: string | null;
  privacy_settings?: { show_general_location?: boolean; share_activity?: boolean } | null;
  preferences?: { weekly_digest?: boolean } | null;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  species(query = ''): Observable<{ data: Species[] }> {
    return this.http.get<{ data: Species[] }>('/api/catalog/v1/species', {
      params: query ? { q: query } : {},
    });
  }

  speciesById(id: string): Observable<Species> {
    return this.http.get<Species>(`/api/catalog/v1/species/${id}`);
  }

  map(): Observable<{ data: Sighting[] }> {
    return this.http.get<{ data: Sighting[] }>('/api/observations/v1/map/sightings');
  }

  mine(): Observable<{ data: Sighting[] }> {
    return this.http.get<{ data: Sighting[] }>('/api/observations/v1/sightings/mine');
  }

  createSighting(payload: Record<string, unknown>): Observable<Sighting> {
    return this.http.post<Sighting>('/api/observations/v1/sightings', payload);
  }

  feed(): Observable<{ data: FeedPost[] }> {
    return this.http.get<{ data: FeedPost[] }>('/api/community/v1/feed');
  }

  login(email: string, password: string): Observable<SessionResponse> {
    return this.http.post<SessionResponse>('/api/accounts/v1/auth/login', { email, password });
  }

  register(name: string, email: string, password: string, password_confirmation: string): Observable<SessionResponse> {
    return this.http.post<SessionResponse>('/api/accounts/v1/auth/register', {
      name, email, password, password_confirmation,
    });
  }

  me(): Observable<UserProfile> {
    return this.http.get<UserProfile>('/api/accounts/v1/me');
  }

  updateMe(payload: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.patch<UserProfile>('/api/accounts/v1/me', payload);
  }

  notifications(): Observable<{ data: Array<{ id: string; type: string; body: string; read_at?: string | null; created_at: string }> }> {
    return this.http.get<{ data: Array<{ id: string; type: string; body: string; read_at?: string | null; created_at: string }> }>('/api/community/v1/notifications');
  }
}
