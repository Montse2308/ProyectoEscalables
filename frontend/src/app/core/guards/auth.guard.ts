import { Injectable } from "@angular/core"
import type { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router"
import type { Observable } from "rxjs"
import type { AuthService } from "../services/auth.service"

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isLoggedIn()) {
      return true
    }

    this.router.navigate(["/auth/login"], { queryParams: { returnUrl: state.url } })
    return false
  }
}
