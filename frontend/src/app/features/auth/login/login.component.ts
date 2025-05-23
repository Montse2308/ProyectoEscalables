import { Component, type OnInit } from "@angular/core"
import { type FormBuilder, type FormGroup, Validators } from "@angular/forms"
import type { Router, ActivatedRoute } from "@angular/router"
import type { AuthService } from "../../../core/services/auth.service"
import { first } from "rxjs/operators"

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup
  loading = false
  submitted = false
  error = ""
  returnUrl = "/dashboard"

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(["/dashboard"])
    }
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    })

    // Get return url from route parameters or default to '/dashboard'
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/dashboard"
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls
  }

  onSubmit(): void {
    this.submitted = true

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return
    }

    this.loading = true
    this.authService
      .login(this.f["email"].value, this.f["password"].value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.router.navigate([this.returnUrl])
        },
        error: (error) => {
          this.error = error.error.message || "Login failed"
          this.loading = false
        },
      })
  }
}
