import { Component, type OnInit } from "@angular/core"
import { type FormBuilder, type FormGroup, Validators } from "@angular/forms"
import type { ExerciseService } from "../../../core/services/exercise.service"
import type { Exercise } from "../../../core/models/exercise.model"

@Component({
  selector: "app-exercise-management",
  templateUrl: "./exercise-management.component.html",
  styleUrls: ["./exercise-management.component.scss"],
})
export class ExerciseManagementComponent implements OnInit {
  exerciseForm!: FormGroup
  exercises: Exercise[] = []
  loading = false
  loadingExercises = false
  submitSuccess = false
  error = ""
  editMode = false
  currentExerciseId: string | null = null
  searchTerm = ""
  filteredExercises: Exercise[] = []
  confirmDelete = false
  exerciseToDelete: Exercise | null = null

  constructor(
    private formBuilder: FormBuilder,
    private exerciseService: ExerciseService,
  ) {}

  ngOnInit(): void {
    this.initForm()
    this.loadExercises()
  }

  initForm(): void {
    this.exerciseForm = this.formBuilder.group({
      name: ["", Validators.required],
      muscleGroup: ["", Validators.required],
      movementType: ["", Validators.required],
      description: [""],
      isCompound: [false],
      isPowerlifting: [false],
    })
  }

  loadExercises(): void {
    this.loadingExercises = true
    this.exerciseService.getExercises().subscribe({
      next: (data) => {
        this.exercises = data
        this.filterExercises()
        this.loadingExercises = false
      },
      error: (error) => {
        this.error = error.error.message || "Failed to load exercises"
        this.loadingExercises = false
      },
    })
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.exerciseForm.controls
  }

  onSubmit(): void {
    if (this.exerciseForm.invalid) {
      return
    }

    this.loading = true
    this.submitSuccess = false
    this.error = ""

    const exerciseData = {
      name: this.f["name"].value,
      muscleGroup: this.f["muscleGroup"].value,
      movementType: this.f["movementType"].value,
      description: this.f["description"].value,
      isCompound: this.f["isCompound"].value,
      isPowerlifting: this.f["isPowerlifting"].value,
    }

    if (this.editMode && this.currentExerciseId) {
      this.exerciseService.updateExercise(this.currentExerciseId, exerciseData).subscribe({
        next: () => {
          this.submitSuccess = true
          this.loading = false
          this.resetForm()
          this.loadExercises()
        },
        error: (error) => {
          this.error = error.error.message || "Failed to update exercise"
          this.loading = false
        },
      })
    } else {
      this.exerciseService.createExercise(exerciseData).subscribe({
        next: () => {
          this.submitSuccess = true
          this.loading = false
          this.resetForm()
          this.loadExercises()
        },
        error: (error) => {
          this.error = error.error.message || "Failed to create exercise"
          this.loading = false
        },
      })
    }
  }

  editExercise(exercise: Exercise): void {
    this.editMode = true
    this.currentExerciseId = exercise._id
    this.exerciseForm.patchValue({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      movementType: exercise.movementType,
      description: exercise.description,
      isCompound: exercise.isCompound,
      isPowerlifting: exercise.isPowerlifting,
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  confirmDeleteExercise(exercise: Exercise): void {
    this.exerciseToDelete = exercise
    this.confirmDelete = true
  }

  cancelDelete(): void {
    this.exerciseToDelete = null
    this.confirmDelete = false
  }

  deleteExercise(): void {
    if (!this.exerciseToDelete) return

    this.loading = true
    this.exerciseService.deleteExercise(this.exerciseToDelete._id).subscribe({
      next: () => {
        this.loading = false
        this.confirmDelete = false
        this.exerciseToDelete = null
        this.loadExercises()
      },
      error: (error) => {
        this.error = error.error.message || "Failed to delete exercise"
        this.loading = false
      },
    })
  }

  resetForm(): void {
    this.exerciseForm.reset({
      isCompound: false,
      isPowerlifting: false,
    })
    this.editMode = false
    this.currentExerciseId = null
  }

  onSearchChange(): void {
    this.filterExercises()
  }

  filterExercises(): void {
    if (!this.searchTerm.trim()) {
      this.filteredExercises = [...this.exercises]
    } else {
      const search = this.searchTerm.toLowerCase().trim()
      this.filteredExercises = this.exercises.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(search) ||
          exercise.muscleGroup.toLowerCase().includes(search) ||
          exercise.movementType.toLowerCase().includes(search) ||
          (exercise.description && exercise.description.toLowerCase().includes(search)),
      )
    }
  }
}
