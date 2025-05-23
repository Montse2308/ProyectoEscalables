import { Component, type OnInit } from "@angular/core"
import { type FormBuilder, type FormGroup, type FormArray, Validators } from "@angular/forms"
import type { StandardService } from "../../../core/services/standard.service"
import type { ExerciseService } from "../../../core/services/exercise.service"
import type { Exercise } from "../../../core/models/exercise.model"
import type { Standard } from "../../../core/models/standard.model"

@Component({
  selector: "app-standard-management",
  templateUrl: "./standard-management.component.html",
  styleUrls: ["./standard-management.component.scss"],
})
export class StandardManagementComponent implements OnInit {
  standardForm!: FormGroup
  exercises: Exercise[] = []
  standards: Standard[] = []
  loading = false
  loadingData = false
  submitSuccess = false
  error = ""
  editMode = false
  currentStandardId: string | null = null
  confirmDelete = false
  standardToDelete: Standard | null = null

  constructor(
    private formBuilder: FormBuilder,
    private standardService: StandardService,
    private exerciseService: ExerciseService,
  ) {}

  ngOnInit(): void {
    this.initForm()
    this.loadData()
  }

  initForm(): void {
    this.standardForm = this.formBuilder.group({
      exercise: ["", Validators.required],
      gender: ["male", Validators.required],
      weightCategories: this.formBuilder.array([]),
    })

    // Add default weight category
    this.addWeightCategory()
  }

  loadData(): void {
    this.loadingData = true

    // Load exercises and standards in parallel
    Promise.all([this.exerciseService.getExercises().toPromise(), this.standardService.getStandards().toPromise()])
      .then(([exercisesData, standardsData]) => {
        this.exercises = exercisesData || []
        this.standards = standardsData || []
        this.loadingData = false
      })
      .catch((error) => {
        this.error = error.error?.message || "Failed to load data"
        this.loadingData = false
      })
  }

  // Convenience getters
  get f() {
    return this.standardForm.controls
  }

  get weightCategories() {
    return this.f["weightCategories"] as FormArray
  }

  getWeightCategoryFormGroup(index: number) {
    return this.weightCategories.at(index) as FormGroup
  }

  getStrengthLevelsFormGroup(categoryIndex: number) {
    return this.getWeightCategoryFormGroup(categoryIndex).get("strengthLevels") as FormGroup
  }

  addWeightCategory(): void {
    const weightCategoryGroup = this.formBuilder.group({
      minWeight: ["", [Validators.required, Validators.min(30)]],
      maxWeight: ["", [Validators.required, Validators.min(30)]],
      strengthLevels: this.formBuilder.group({
        beginner: ["", [Validators.required, Validators.min(0)]],
        novice: ["", [Validators.required, Validators.min(0)]],
        intermediate: ["", [Validators.required, Validators.min(0)]],
        advanced: ["", [Validators.required, Validators.min(0)]],
        elite: ["", [Validators.required, Validators.min(0)]],
      }),
    })

    this.weightCategories.push(weightCategoryGroup)
  }

  removeWeightCategory(index: number): void {
    this.weightCategories.removeAt(index)
  }

  onSubmit(): void {
    if (this.standardForm.invalid) {
      return
    }

    this.loading = true
    this.submitSuccess = false
    this.error = ""

    const standardData = {
      exercise: this.f["exercise"].value,
      gender: this.f["gender"].value,
      weightCategories: this.weightCategories.value,
    }

    if (this.editMode && this.currentStandardId) {
      this.standardService.updateStandard(this.currentStandardId, standardData).subscribe({
        next: () => {
          this.submitSuccess = true
          this.loading = false
          this.resetForm()
          this.loadData()
        },
        error: (error) => {
          this.error = error.error.message || "Failed to update standard"
          this.loading = false
        },
      })
    } else {
      this.standardService.createStandard(standardData).subscribe({
        next: () => {
          this.submitSuccess = true
          this.loading = false
          this.resetForm()
          this.loadData()
        },
        error: (error) => {
          this.error = error.error.message || "Failed to create standard"
          this.loading = false
        },
      })
    }
  }

  editStandard(standard: Standard): void {
    this.editMode = true
    this.currentStandardId = standard._id

    // Clear existing weight categories
    while (this.weightCategories.length) {
      this.weightCategories.removeAt(0)
    }

    // Set form values
    this.standardForm.patchValue({
      exercise: standard.exercise._id,
      gender: standard.gender,
    })

    // Add weight categories
    standard.weightCategories.forEach((category) => {
      const categoryGroup = this.formBuilder.group({
        minWeight: [category.minWeight, [Validators.required, Validators.min(30)]],
        maxWeight: [category.maxWeight, [Validators.required, Validators.min(30)]],
        strengthLevels: this.formBuilder.group({
          beginner: [category.strengthLevels.beginner, [Validators.required, Validators.min(0)]],
          novice: [category.strengthLevels.novice, [Validators.required, Validators.min(0)]],
          intermediate: [category.strengthLevels.intermediate, [Validators.required, Validators.min(0)]],
          advanced: [category.strengthLevels.advanced, [Validators.required, Validators.min(0)]],
          elite: [category.strengthLevels.elite, [Validators.required, Validators.min(0)]],
        }),
      })

      this.weightCategories.push(categoryGroup)
    })

    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  confirmDeleteStandard(standard: Standard): void {
    this.standardToDelete = standard
    this.confirmDelete = true
  }

  cancelDelete(): void {
    this.standardToDelete = null
    this.confirmDelete = false
  }

  deleteStandard(): void {
    if (!this.standardToDelete) return

    this.loading = true
    this.standardService.deleteStandard(this.standardToDelete._id).subscribe({
      next: () => {
        this.loading = false
        this.confirmDelete = false
        this.standardToDelete = null
        this.loadData()
      },
      error: (error) => {
        this.error = error.error.message || "Failed to delete standard"
        this.loading = false
      },
    })
  }

  resetForm(): void {
    this.standardForm.reset({
      gender: "male",
    })

    // Clear existing weight categories
    while (this.weightCategories.length) {
      this.weightCategories.removeAt(0)
    }

    // Add default weight category
    this.addWeightCategory()

    this.editMode = false
    this.currentStandardId = null
  }

  getExerciseName(exerciseId: string): string {
    const exercise = this.exercises.find((e) => e._id === exerciseId)
    return exercise ? exercise.name : "Unknown Exercise"
  }
}
