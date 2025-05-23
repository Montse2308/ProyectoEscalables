import { Component, type OnInit } from "@angular/core"
import { type FormBuilder, type FormGroup, Validators } from "@angular/forms"
import type { UserService } from "../../../core/services/user.service"
import type { AuthService } from "../../../core/services/auth.service"
import type { User } from "../../../core/models/user.model"

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup
  bodyMeasurementsForm!: FormGroup
  user: User | null = null
  loading = false
  loadingUser = false
  updateSuccess = false
  error = ""
  activeTab = "profile" // 'profile' or 'measurements'

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.initForms()
    this.loadUserProfile()
  }

  initForms(): void {
    this.profileForm = this.formBuilder.group({
      name: ["", Validators.required],
      email: [{ value: "", disabled: true }], // Email cannot be changed
      gender: ["", Validators.required],
      age: ["", [Validators.required, Validators.min(13), Validators.max(100)]],
      weight: ["", [Validators.required, Validators.min(30), Validators.max(300)]],
      height: ["", [Validators.required, Validators.min(100), Validators.max(250)]],
    })

    this.bodyMeasurementsForm = this.formBuilder.group({
      chest: ["", [Validators.min(30), Validators.max(200)]],
      waist: ["", [Validators.min(30), Validators.max(200)]],
      hips: ["", [Validators.min(30), Validators.max(200)]],
      arms: ["", [Validators.min(10), Validators.max(100)]],
      legs: ["", [Validators.min(20), Validators.max(150)]],
    })
  }

  loadUserProfile(): void {
    this.loadingUser = true
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user
        this.populateForms(user)
        this.loadingUser = false
      },
      error: (error) => {
        this.error = error.error.message || "Failed to load user profile"
        this.loadingUser = false
      },
    })
  }

  populateForms(user: User): void {
    this.profileForm.patchValue({
      name: user.name,
      email: user.email,
      gender: user.gender,
      age: user.age,
      weight: user.weight,
      height: user.height,
    })

    if (user.bodyMeasurements) {
      this.bodyMeasurementsForm.patchValue({
        chest: user.bodyMeasurements.chest,
        waist: user.bodyMeasurements.waist,
        hips: user.bodyMeasurements.hips,
        arms: user.bodyMeasurements.arms,
        legs: user.bodyMeasurements.legs,
      })
    }
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.profileForm.controls
  }

  get m() {
    return this.bodyMeasurementsForm.controls
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab
  }

  onSubmitProfile(): void {
    if (this.profileForm.invalid) {
      return
    }

    this.loading = true
    this.updateSuccess = false
    this.error = ""

    const profileData = {
      name: this.f["name"].value,
      gender: this.f["gender"].value,
      age: this.f["age"].value,
      weight: this.f["weight"].value,
      height: this.f["height"].value,
    }

    this.userService.updateProfile(profileData).subscribe({
      next: () => {
        this.updateSuccess = true
        this.loading = false
        // Refresh user data
        this.loadUserProfile()
      },
      error: (error) => {
        this.error = error.error.message || "Failed to update profile"
        this.loading = false
      },
    })
  }

  onSubmitMeasurements(): void {
    if (this.bodyMeasurementsForm.invalid) {
      return
    }

    this.loading = true
    this.updateSuccess = false
    this.error = ""

    const measurementsData = {
      bodyMeasurements: {
        chest: this.m["chest"].value,
        waist: this.m["waist"].value,
        hips: this.m["hips"].value,
        arms: this.m["arms"].value,
        legs: this.m["legs"].value,
      },
    }

    this.userService.updateProfile(measurementsData).subscribe({
      next: () => {
        this.updateSuccess = true
        this.loading = false
        // Refresh user data
        this.loadUserProfile()
      },
      error: (error) => {
        this.error = error.error.message || "Failed to update measurements"
        this.loading = false
      },
    })
  }
}
