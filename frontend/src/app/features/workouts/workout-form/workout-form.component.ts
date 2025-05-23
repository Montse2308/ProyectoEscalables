import { Component, type OnInit } from "@angular/core"
import { type FormBuilder, type FormGroup, type FormArray, Validators } from "@angular/forms"
import type { ActivatedRoute, Router } from "@angular/router"
import type { WorkoutService } from "../../../core/services/workout.service"
import type { ExerciseService } from "../../../core/services/exercise.service"
import type { Exercise } from "../../../core/models/exercise.model"
import type { Workout } from "../../../core/models/workout.model"

@Component({
  selector: "app-workout-form",
  templateUrl: "./workout-form.component.html",
  styleUrls: ["./workout-form.component.scss"],
})
export class WorkoutFormComponent implements OnInit {
  workoutForm!: FormGroup
  exercises: Exercise[] = []
  loading = false
  loadingData = false
  submitSuccess = false
  error = ""
  editMode = false
  workoutId: string | null = null
  filteredExercises: Exercise[] = []
  searchTerm = ""
  isCompleting = false

  constructor(
    private formBuilder: FormBuilder,
    private workoutService: WorkoutService,
    private exerciseService: ExerciseService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initForm()
    this.loadExercises()

    // Check if we're in edit mode
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.workoutId = params["id"]
        this.loadWorkout(this.workoutId)
      }
    })
  }

  initForm(): void {
    this.workoutForm = this.formBuilder.group({
      name: ["", Validators.required],
      date: [new Date().toISOString().split("T")[0], Validators.required],
      notes: [""],
      duration: ["", [Validators.min(0)]],
      exercises: this.formBuilder.array([]),
    })
  }

  loadExercises(): void {
    this.loadingData = true
    this.exerciseService.getExercises().subscribe({
      next: (data) => {
        this.exercises = data
        this.filteredExercises = [...this.exercises]
        this.loadingData = false
      },
      error: (error) => {
        this.error = error.error.message || "Failed to load exercises"
        this.loadingData = false
      },
    })
  }

  loadWorkout(id: string): void {
    this.loadingData = true
    this.workoutService.getWorkout(id).subscribe({
      next: (workout) => {
        this.editMode = true
        this.patchFormWithWorkout(workout)
        this.loadingData = false
      },
      error: (error) => {
        this.error = error.error.message || "Failed to load workout"
        this.loadingData = false
        this.router.navigate(["/workouts"])
      },
    })
  }

  patchFormWithWorkout(workout: Workout): void {
    // Format date to YYYY-MM-DD for input[type="date"]
    const date = new Date(workout.date).toISOString().split("T")[0]

    this.workoutForm.patchValue({
      name: workout.name,
      date: date,
      notes: workout.notes,
      duration: workout.duration,
    })

    // Clear existing exercises
    while (this.exercisesArray.length) {
      this.removeExercise(0)
    }

    // Add exercises from workout
    workout.exercises.forEach((exercisePerformed) => {
      this.addExercise(exercisePerformed.exercise._id)

      // Get the last added exercise form group
      const exerciseFormGroup = this.exercisesArray.at(this.exercisesArray.length - 1) as FormGroup
      const setsArray = exerciseFormGroup.get("sets") as FormArray

      // Clear default set
      if (setsArray.length > 0) {
        setsArray.removeAt(0)
      }

      // Add sets from workout
      exercisePerformed.sets.forEach((set) => {
        this.addSet(this.exercisesArray.length - 1, set.reps, set.weight, set.rpe, set.notes)
      })
    })
  }

  // Convenience getters
  get f() {
    return this.workoutForm.controls
  }

  get exercisesArray() {
    return this.f["exercises"] as FormArray
  }

  getExerciseFormGroup(index: number) {
    return this.exercisesArray.at(index) as FormGroup
  }

  getSetsArray(exerciseIndex: number) {
    return this.getExerciseFormGroup(exerciseIndex).get("sets") as FormArray
  }

  addExercise(exerciseId?: string): void {
    const exerciseGroup = this.formBuilder.group({
      exercise: [exerciseId || "", Validators.required],
      sets: this.formBuilder.array([]),
    })

    this.exercisesArray.push(exerciseGroup)

    // Add default set
    this.addSet(this.exercisesArray.length - 1)
  }

  removeExercise(index: number): void {
    this.exercisesArray.removeAt(index)
  }

  addSet(exerciseIndex: number, reps?: number, weight?: number, rpe?: number, notes?: string): void {
    const setGroup = this.formBuilder.group({
      reps: [reps || "", [Validators.required, Validators.min(1)]],
      weight: [weight || "", [Validators.required, Validators.min(0)]],
      rpe: [rpe || "", [Validators.min(0), Validators.max(10)]],
      notes: [notes || ""],
    })

    this.getSetsArray(exerciseIndex).push(setGroup)
  }

  removeSet(exerciseIndex: number, setIndex: number): void {
    this.getSetsArray(exerciseIndex).removeAt(setIndex)
  }

  onSubmit(complete = false): void {
    if (this.workoutForm.invalid) {
      return
    }

    this.loading = true
    this.isCompleting = complete
    this.submitSuccess = false
    this.error = ""

    const workoutData = {
      name: this.f["name"].value,
      date: this.f["date"].value,
      notes: this.f["notes"].value,
      duration: this.f["duration"].value,
      exercises: this.exercisesArray.value,
      isCompleted: complete,
    }

    if (this.editMode && this.workoutId) {
      this.workoutService.updateWorkout(this.workoutId, workoutData).subscribe({
        next: () => {
          this.submitSuccess = true
          this.loading = false
          setTimeout(() => {
            if (complete) {
              this.router.navigate(["/workouts"])
            } else {
              this.router.navigate(["/workouts", this.workoutId])
            }
          }, 1500)
        },
        error: (error) => {
          this.error = error.error.message || "Failed to update workout"
          this.loading = false
        },
      })
    } else {
      this.workoutService.createWorkout(workoutData).subscribe({
        next: (workout) => {
          this.submitSuccess = true
          this.loading = false
          setTimeout(() => {
            if (complete) {
              this.router.navigate(["/workouts"])
            } else {
              this.router.navigate(["/workouts", workout._id])
            }
          }, 1500)
        },
        error: (error) => {
          this.error = error.error.message || "Failed to create workout"
          this.loading = false
        },
      })
    }
  }

  cancel(): void {
    if (this.editMode && this.workoutId) {
      this.router.navigate(["/workouts", this.workoutId])
    } else {
      this.router.navigate(["/workouts"])
    }
  }

  getExerciseName(exerciseId: string): string {
    const exercise = this.exercises.find((e) => e._id === exerciseId)
    return exercise ? exercise.name : ""
  }

  onSearchChange(): void {
    if (!this.searchTerm.trim()) {
      this.filteredExercises = [...this.exercises]
    } else {
      const search = this.searchTerm.toLowerCase().trim()
      this.filteredExercises = this.exercises.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(search) ||
          exercise.muscleGroup.toLowerCase().includes(search) ||
          exercise.movementType.toLowerCase().includes(search),
      )
    }
  }
}
