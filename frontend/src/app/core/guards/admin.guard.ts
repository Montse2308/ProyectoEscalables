import { Injectable } from "@angular/core"
import type { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router"
import type { Observable } from "rxjs"
import type { AuthService } from "../services/auth.service"

@Injectable({
  providedIn: "root",
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isAdmin()) {
      return true
    }

    this.router.navigate(["/dashboard"])
    return false
  }
}
