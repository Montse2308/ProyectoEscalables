import { Component, type OnInit } from "@angular/core"
import type { ActivatedRoute, Router } from "@angular/router"
import type { TemplateService } from "../../../core/services/template.service"
import type { WorkoutService } from "../../../core/services/workout.service"
import type { Template } from "../../../core/models/template.model"

@Component({
  selector: "app-template-detail",
  templateUrl: "./template-detail.component.html",
  styleUrls: ["./template-detail.component.scss"],
})
export class TemplateDetailComponent implements OnInit {
  template: Template | null = null
  loading = false
  startingWorkout = false
  error = ""
  templateId: string | null = null

  constructor(
    private templateService: TemplateService,
    private workoutService: WorkoutService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.templateId = params["id"]
        this.loadTemplate(this.templateId)
      } else {
        this.router.navigate(["/templates"])
      }
    })
  }

  loadTemplate(id: string): void {
    this.loading = true
    this.templateService.getTemplate(id).subscribe({
      next: (template) => {
        this.template = template
        this.loading = false
      },
      error: (error) => {
        this.error = error.error.message || "Failed to load template"
        this.loading = false
        this.router.navigate(["/templates"])
      },
    })
  }

  startWorkout(): void {
    if (!this.template) return

    this.startingWorkout = true
    this.workoutService.startWorkoutFromTemplate(this.template._id).subscribe({
      next: (workout) => {
        this.startingWorkout = false
        this.router.navigate(["/workouts", workout._id])
      },
      error: (error) => {
        this.error = error.error.message || "Failed to start workout"
        this.startingWorkout = false
      },
    })
  }

  editTemplate(): void {
    if (!this.templateId) return
    this.router.navigate(["/templates/edit", this.templateId])
  }

  goBack(): void {
    this.router.navigate(["/templates"])
  }

  getExerciseCount(): number {
    return this.template ? this.template.exercises.length : 0
  }

  getTotalSets(): number {
    if (!this.template) return 0
    return this.template.exercises.reduce((total, exercise) => total + exercise.sets, 0)
  }

  getEstimatedDuration(): number {
    if (!this.template) return 0

    // Calculate estimated duration in minutes
    // Formula: Sum of (sets * (avg time per set + rest time))
    const avgTimePerSet = 45 // seconds

    return (
      this.template.exercises.reduce((total, exercise) => {
        const exerciseTime = exercise.sets * (avgTimePerSet + exercise.restTime)
        return total + exerciseTime
      }, 0) / 60
    ) // Convert to minutes
  }
}
