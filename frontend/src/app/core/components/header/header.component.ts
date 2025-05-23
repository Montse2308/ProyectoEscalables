import { Component, type OnInit } from "@angular/core"
import type { Router } from "@angular/router"
import type { AuthService } from "../../services/auth.service"
import type { User } from "../../models/user.model"

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null
  isMenuOpen = false

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe((user) => {
      this.currentUser = user
    })
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen
  }

  closeMenu(): void {
    this.isMenuOpen = false
  }

  logout(): void {
    this.authService.logout()
    this.closeMenu()
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn()
  }

  isAdmin(): boolean {
    return this.authService.isAdmin()
  }

  navigateTo(route: string): void {
    this.router.navigate([route])
    this.closeMenu()
  }
}
