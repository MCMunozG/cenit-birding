import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { SessionService } from "./session.service";

/**
 * Redirects anonymous users to login while retaining the requested URL.
 * It is navigation UX only, never a substitute for backend authorization.
 */
export const authenticatedGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionService);
  const router = inject(Router);

  return session.hasToken()
    ? true
    : router.createUrlTree(["/ingresar"], {
        queryParams: { returnUrl: state.url },
      });
};
