import { Component, type OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, type FormGroup, Validators, FormArray } from '@angular/forms'; 
import { ExerciseService } from '../../../core/services/exercise.service';
import { Exercise } from '../../../core/models/exercise.model'; 
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

interface MuscleGroupOption {
  value: string;
  label: string;
  category: 'upper' | 'lower' | 'core' | 'full';
}

@Component({
  selector: 'app-exercise-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './exercise-management.component.html',
  styleUrls: ['./exercise-management.component.scss'],
})
export class ExerciseManagementComponent implements OnInit, OnDestroy {
  exerciseForm!: FormGroup;
  exercises: Exercise[] = [];
  loading = false;
  loadingExercises = false;
  submitSuccess = false;
  error = '';
  editMode = false;
  currentExerciseId: string | null = null;
  searchTerm = '';
  filteredExercises: Exercise[] = [];
  confirmDelete = false;
  exerciseToDelete: Exercise | null = null;

  private exerciseTypeSubscription?: Subscription;

  muscleGroupOptions: MuscleGroupOption[] = [
    { value: 'pecho', label: 'Pecho', category: 'upper' },
    { value: 'espalda', label: 'Espalda', category: 'upper' },
    { value: 'hombros', label: 'Hombros', category: 'upper' },
    { value: 'biceps', label: 'Bíceps', category: 'upper' },
    { value: 'triceps', label: 'Tríceps', category: 'upper' },
    { value: 'antebrazos', label: 'Antebrazos', category: 'upper' },
    { value: 'cuadriceps', label: 'Cuádriceps', category: 'lower' },
    { value: 'femorales', label: 'Femorales', category: 'lower' },
    { value: 'gluteos', label: 'Glúteos', category: 'lower' },
    { value: 'pantorrillas', label: 'Pantorrillas', category: 'lower' },
    { value: 'core', label: 'Core', category: 'core' },
    { value: 'cuerpo_completo', label: 'Cuerpo Completo', category: 'full' },
  ];

  movementTypeOptions = [
    { value: 'push', label: 'Empuje (Push)' },
    { value: 'pull', label: 'Tracción (Pull)' },
    { value: 'squat', label: 'Sentadilla (Squat)' },
    { value: 'hinge', label: 'Bisagra de Cadera (Hinge)' },
    { value: 'carry', label: 'Acarreo (Carry)' },
    { value: 'rotation', label: 'Rotación' },
    { value: 'isometric', label: 'Isométrico' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private exerciseService: ExerciseService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadExercises();
    this.setupConditionalValidation();
  }

  ngOnDestroy(): void {
    this.exerciseTypeSubscription?.unsubscribe();
  }

  initForm(): void {
    this.exerciseForm = this.formBuilder.group({
      name: ['', Validators.required],
      exerciseType: ['specific', Validators.required], 
      muscleGroups: this.formBuilder.control([], [Validators.required, Validators.minLength(1)]), 
      movementType: ['', Validators.required],
      description: [''],
      isPowerlifting: [false],
    });
  }

  setupConditionalValidation(): void {
    this.exerciseTypeSubscription = this.exerciseForm.get('exerciseType')?.valueChanges.subscribe(type => {
      const muscleGroupsControl = this.exerciseForm.get('muscleGroups');
      if (type === 'specific') {
        muscleGroupsControl?.setValue('');
      } else if (type === 'compound') {
        muscleGroupsControl?.setValue([]);
      } else {
        muscleGroupsControl?.setValue([]);
      }
      muscleGroupsControl?.markAsUntouched();
      muscleGroupsControl?.markAsPristine();
      muscleGroupsControl?.updateValueAndValidity();
    });
  }

  onMuscleGroupCheckboxChange(event: Event, groupValue: string): void {
    const target = event.target as HTMLInputElement;
    const muscleGroupsControl = this.exerciseForm.get('muscleGroups');

    if (muscleGroupsControl) {
      let currentValues: string[] = muscleGroupsControl.value || [];
      if (target.checked) {
        if (!currentValues.includes(groupValue)) {
          currentValues = [...currentValues, groupValue];
        }
      } else {
        currentValues = currentValues.filter(val => val !== groupValue);
      }
      muscleGroupsControl.setValue(currentValues);
      muscleGroupsControl.markAsTouched();
    }
  }


  isMuscleGroupSelectedForCompound(groupValue: string): boolean {
    const muscleGroupsControl = this.exerciseForm.get('muscleGroups');
    if (muscleGroupsControl && Array.isArray(muscleGroupsControl.value)) {
      return muscleGroupsControl.value.includes(groupValue);
    }
    return false;
  }

  onSubmit(): void {
    if (this.exerciseForm.invalid) {
      Object.values(this.exerciseForm.controls).forEach(control => {
        control.markAsTouched();
      });
      this.error = "Por favor, corrige los errores en el formulario.";
      return;
    }

    this.loading = true;
    this.submitSuccess = false;
    this.error = '';

    let muscleGroupsValue = this.f['muscleGroups'].value;
    if (this.f['exerciseType'].value === 'specific') {
        muscleGroupsValue = muscleGroupsValue ? [muscleGroupsValue] : [];
    }

    if (this.f['exerciseType'].value === 'specific' && muscleGroupsValue.length > 1) {
        this.error = 'Para ejercicios específicos, solo puedes seleccionar un grupo muscular.';
        this.loading = false;
        return;
    }
    if (this.f['exerciseType'].value === 'specific' && muscleGroupsValue.length === 0 && this.f['muscleGroups'].errors?.['required']) {
        this.error = 'Debes seleccionar un grupo muscular para ejercicios específicos.';
        this.loading = false;
        return;
    }
     if (this.f['exerciseType'].value === 'compound' && muscleGroupsValue.length === 0 && this.f['muscleGroups'].errors?.['minlength']) {
        this.error = 'Debes seleccionar al menos un grupo muscular para ejercicios compuestos.';
        this.loading = false;
        return;
    }
    const exerciseData: Partial<Exercise> = {
      name: this.f['name'].value,
      exerciseType: this.f['exerciseType'].value,
      muscleGroups: muscleGroupsValue,
      movementType: this.f['movementType'].value,
      description: this.f['description'].value,
      isPowerlifting: this.f['isPowerlifting'].value,
    };

    if (this.editMode && this.currentExerciseId) {
      this.exerciseService
        .updateExercise(this.currentExerciseId, exerciseData)
        .subscribe({
          next: () => {
            this.submitSuccess = true;
            this.loading = false;
            this.resetForm();
            this.loadExercises();
            setTimeout(() => this.submitSuccess = false, 3000);
          },
          error: (error) => {
            this.error = 'Error al actualizar el ejercicio: ' + (error.error?.message || error.message);
            this.loading = false;
          },
        });
    } else {
      this.exerciseService.createExercise(exerciseData).subscribe({
        next: () => {
          this.submitSuccess = true;
          this.loading = false;
          this.resetForm();
          this.loadExercises();
          setTimeout(() => this.submitSuccess = false, 3000);
        },
        error: (error) => {
          this.error = 'Error al crear el ejercicio: ' + (error.error?.message || error.message);
          this.loading = false;
        },
      });
    }
  }


  loadExercises(): void {
    this.loadingExercises = true;
    this.exerciseService.getExercises().subscribe({
      next: (data) => {
        this.exercises = data;
        this.filterExercises();
        this.loadingExercises = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los ejercicios: ' + (error.error?.message || error.message);
        this.loadingExercises = false;
      },
    });
  }

  get f() {
    return this.exerciseForm.controls;
  }


  editExercise(exercise: Exercise): void {
    this.editMode = true;
    this.currentExerciseId = exercise._id;
    this.exerciseForm.patchValue({
      name: exercise.name,
      exerciseType: exercise.exerciseType,
      muscleGroups: exercise.muscleGroups, 
      movementType: exercise.movementType,
      description: exercise.description,
      isPowerlifting: exercise.isPowerlifting,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  confirmDeleteExercise(exercise: Exercise): void {
    this.exerciseToDelete = exercise;
    this.confirmDelete = true;
  }

  cancelDelete(): void {
    this.exerciseToDelete = null;
    this.confirmDelete = false;
  }

  deleteExercise(): void {
    if (!this.exerciseToDelete) return;
    this.loading = true; 
    this.exerciseService.deleteExercise(this.exerciseToDelete._id).subscribe({
      next: () => {
        this.loading = false;
        this.confirmDelete = false;
        this.exerciseToDelete = null;
        this.loadExercises();
      },
      error: (error) => {
        this.error = 'Error al eliminar el ejercicio: ' + (error.error?.message || error.message);
        this.loading = false;
      },
    });
  }

  resetForm(): void {
    this.exerciseForm.reset({
      exerciseType: 'specific', 
      muscleGroups: [],
      isPowerlifting: false,
    });
    this.editMode = false;
    this.currentExerciseId = null;
    this.error = '';
    this.submitSuccess = false;
    Object.values(this.exerciseForm.controls).forEach(control => {
        control.markAsPristine();
        control.markAsUntouched();
    });
  }

  onSearchChange(): void {
    this.filterExercises();
  }

  filterExercises(): void {
    if (!this.searchTerm.trim()) {
      this.filteredExercises = [...this.exercises];
    } else {
      const search = this.searchTerm.toLowerCase().trim();
      this.filteredExercises = this.exercises.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(search) ||
          (exercise.muscleGroups && exercise.muscleGroups.some(mg => mg.toLowerCase().includes(search))) ||
          exercise.movementType.toLowerCase().includes(search) ||
          (exercise.description &&
            exercise.description.toLowerCase().includes(search))
      );
    }
  }

  getMovementTypeLabel(movementTypeValue: string): string {
    const foundType = this.movementTypeOptions.find(mt => mt.value === movementTypeValue);
    return foundType ? foundType.label : movementTypeValue; 
  }

}