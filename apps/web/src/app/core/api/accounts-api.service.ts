import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  SessionResponse,
  UserProfile,
} from "../../shared/models/accounts.models";

/** HTTP boundary for the Accounts context; it deliberately exposes no session storage. */
@Injectable({ providedIn: "root" })
export class AccountsApiService {
  constructor(private readonly http: HttpClient) {}

  /** Exchanges credentials for the token pair issued by Accounts. */
  login(email: string, password: string): Observable<SessionResponse> {
    return this.http.post<SessionResponse>("/api/accounts/v1/auth/login", {
      email,
      password,
    });
  }

  /** Uses the API field name at this boundary so pages can keep a TypeScript-friendly name. */
  register(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ): Observable<SessionResponse> {
    return this.http.post<SessionResponse>("/api/accounts/v1/auth/register", {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
  }

  me(): Observable<UserProfile> {
    return this.http.get<UserProfile>("/api/accounts/v1/me");
  }
  updateMe(payload: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.patch<UserProfile>("/api/accounts/v1/me", payload);
  }
}
