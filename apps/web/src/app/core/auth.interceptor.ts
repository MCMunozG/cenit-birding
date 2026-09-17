import { HttpInterceptorFn } from "@angular/common/http";

/** Attaches the current access token; authorization is still enforced by every Laravel API. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem("cenit_access_token");
  return next(
    token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req,
  );
};
