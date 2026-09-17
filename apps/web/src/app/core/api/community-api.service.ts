import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { FeedPost, Notification } from "../../shared/models/community.models";

/** Client for Community projections used by the SPA. */
@Injectable({ providedIn: "root" })
export class CommunityApiService {
  constructor(private readonly http: HttpClient) {}

  feed(): Observable<{ data: FeedPost[] }> {
    return this.http.get<{ data: FeedPost[] }>("/api/community/v1/feed");
  }
  notifications(): Observable<{ data: Notification[] }> {
    return this.http.get<{ data: Notification[] }>(
      "/api/community/v1/notifications",
    );
  }
}
