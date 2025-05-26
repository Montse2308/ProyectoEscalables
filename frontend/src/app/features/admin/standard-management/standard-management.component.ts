import { Component, type OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, type FormGroup, Validators, FormControl } from '@angular/forms';
import { StandardService } from '../../../core/services/standard.service';
import { ExerciseService } from '../../../core/services/exercise.service';
import { Exercise } from '../../../core/models/exercise.model';
import { Standard, StrengthLevelRatios } from '../../../core/models/standard.model';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface Level {
  key: keyof StrengthLevelRatios;
  label: string;
}

@Component({
  selector: 'app-standard-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TitleCasePipe],
  templateUrl: './standard-management.component.html',
  styleUrls: ['./standard-management.component.scss'],
  providers: [TitleCasePipe]
})
export class StandardManagementComponent implements OnInit, OnDestroy {
  standardForm!: FormGroup;
  exercises: Exercise[] = [];
  standards: Standard[] = [];
  loading = false;
  loadingData = false;
  submitSuccess = false;
  error = '';
  editMode = false;
  currentStandardId: string | null = null;

  private formValueChangesSubscription: Subscription = new Subscription();

  strengthLevelsDef: Level[] = [
    { key: 'principiante', label: 'Principiante' },
    { key: 'novato', label: 'Novato' },
    { key: 'intermedio', label: 'Intermedio' },
    { key: 'avanzado', label: 'Avanzado' },
    { key: 'elite', label: 'Élite' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private standardService: StandardService,
    private exerciseService: ExerciseService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
    this.setupFormListeners();
  }

  ngOnDestroy(): void {
    this.formValueChangesSubscription.unsubscribe();
  }

  initForm(): void {
    const ratiosGroup: { [key: string]: FormControl } = {};
    this.strengthLevelsDef.forEach(level => {
      ratiosGroup[level.key] = this.formBuilder.control('', [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^\d*(\.\d{1,3})?$/)
      ]);
    });

    this.standardForm = this.formBuilder.group({
      exercise: ['', Validators.required],
      gender: ['male', Validators.required],
      ratios: this.formBuilder.group(ratiosGroup),
    });
  }

  setupFormListeners(): void {
    const exerciseControl = this.standardForm.get('exercise');
    const genderControl = this.standardForm.get('gender');

    if (exerciseControl) {
      const exerciseSub = exerciseControl.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(() => {
        this.loadExistingStandardForEdit();
      });
      this.formValueChangesSubscription.add(exerciseSub);
    }

    if (genderControl) {
      const genderSub = genderControl.valueChanges.pipe(
        distinctUntilChanged()
      ).subscribe(() => {
        this.loadExistingStandardForEdit();
      });
      this.formValueChangesSubscription.add(genderSub);
    }
  }

  loadInitialData(): void {
    this.loadingData = true;
    this.error = '';
    Promise.all([
      this.exerciseService.getExercises().toPromise(),
      this.standardService.getStandards().toPromise(),
    ])
      .then(([exercisesData, standardsData]) => {
        this.exercises = (exercisesData || [])
          .filter(ex => ex.isPowerlifting || ex.exerciseType === 'compound')
          .sort((a, b) => a.name.localeCompare(b.name));
        
        this.standards = (standardsData || []).sort((a, b) => {
          const nameA = (typeof a.exercise === 'object' && a.exercise !== null) ? a.exercise.name : '';
          const nameB = (typeof b.exercise === 'object' && b.exercise !== null) ? b.exercise.name : '';
          return (nameA + a.gender).localeCompare(nameB + b.gender);
        });

        this.loadingData = false;
        if (this.f['exercise'].value) {
          this.loadExistingStandardForEdit();
        }
      })
      .catch((err) => {
        this.error = err.error?.message || 'Error al cargar datos iniciales. Por favor, recarga la página.';
        this.loadingData = false;
      });
  }

  loadExistingStandardForEdit(): void {
    const exerciseId = this.f['exercise'].value;
    const gender = this.f['gender'].value;

    this.submitSuccess = false;
    this.error = '';

    if (!exerciseId || !gender) {
      this.resetRatiosForm(false);
      this.editMode = false;
      this.currentStandardId = null;
      return;
    }

    const existingStandard = this.standards.find(s => {
      const standardExerciseId = typeof s.exercise === 'string' ? s.exercise : s.exercise?._id;
      return standardExerciseId === exerciseId && s.gender === gender;
    });

    if (existingStandard) {
      this.editMode = true;
      this.currentStandardId = existingStandard._id;
      if (existingStandard.ratios) {
        this.standardForm.get('ratios')?.patchValue(existingStandard.ratios, { emitEvent: false });
      } else {
        this.resetRatiosForm(false); 
        console.warn(`El estándar existente con ID ${existingStandard._id} no tiene un campo 'ratios'. Se mostrará el formulario de ratios vacío.`);
      }
    } else {
      this.resetRatiosForm(false);
      this.editMode = false;
      this.currentStandardId = null;
    }
  }

  get f() {
    return this.standardForm.controls;
  }

  get ratiosFormGroup() {
    return this.f['ratios'] as FormGroup;
  }

  onSubmit(): void {
    if (this.standardForm.invalid) {
      this.standardForm.markAllAsTouched();
      this.error = "Por favor, completa todos los campos de ratios con valores numéricos válidos (ej. 0.75, 1.0, 1.255).";
      this.loading = false;
      return;
    }

    this.loading = true;
    this.submitSuccess = false;
    this.error = '';

    const standardDataFromForm = this.standardForm.value;
    const standardPayload = {
      exercise: standardDataFromForm.exercise,
      gender: standardDataFromForm.gender,
      ratios: standardDataFromForm.ratios,
    };

    const operation = this.editMode && this.currentStandardId
      ? this.standardService.updateStandard(this.currentStandardId, standardPayload)
      : this.standardService.createStandard(standardPayload);

    operation.subscribe({
      next: (savedStandard: Standard) => {
        this.submitSuccess = true;
        this.loading = false;
        this.error = "";

        const exerciseIdFromSaved = typeof savedStandard.exercise === 'string' 
            ? savedStandard.exercise 
            : (savedStandard.exercise as Exercise)?._id;

        const fullExerciseDetails = this.exercises.find(ex => ex._id === exerciseIdFromSaved);

        let finalExerciseObjectForStandard: Exercise;

        if (fullExerciseDetails) {
            finalExerciseObjectForStandard = fullExerciseDetails;
        } else if (typeof savedStandard.exercise === 'object' && savedStandard.exercise !== null && (savedStandard.exercise as Exercise)._id && (savedStandard.exercise as Exercise).name) {
             finalExerciseObjectForStandard = {
                _id: (savedStandard.exercise as Exercise)._id,
                name: (savedStandard.exercise as Exercise).name,
                muscleGroups: (savedStandard.exercise as Exercise).muscleGroups || [],
                exerciseType: (savedStandard.exercise as Exercise).exerciseType || 'specific',
                movementType: (savedStandard.exercise as Exercise).movementType || '',
                isPowerlifting: (savedStandard.exercise as Exercise).isPowerlifting || false,
                description: (savedStandard.exercise as Exercise).description || '',
                createdBy: (savedStandard.exercise as Exercise).createdBy || '', 
                createdAt: (savedStandard.exercise as Exercise).createdAt || new Date(),
                updatedAt: (savedStandard.exercise as Exercise).updatedAt || new Date(),
             };
        } else {
            console.warn(`Detalles completos para el ejercicio ID ${exerciseIdFromSaved} no encontrados. Se crea un objeto parcial.`);
            finalExerciseObjectForStandard = {
                _id: exerciseIdFromSaved || 'ID_DESCONOCIDO',
                name: `Ejercicio (ID: ${exerciseIdFromSaved || 'DESCONOCIDO'})`,
                muscleGroups: [],
                exerciseType: 'specific',
                movementType: '',
                isPowerlifting: false,
                description: '',
                createdBy: '',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        }
        
        const processedSavedStandard: Standard = {
          ...savedStandard,
          exercise: finalExerciseObjectForStandard
        };

        if (this.editMode && this.currentStandardId) {
          const index = this.standards.findIndex(s => s._id === this.currentStandardId);
          if (index !== -1) {
            this.standards[index] = processedSavedStandard;
          }
        } else {
          this.standards.push(processedSavedStandard);
          this.standards.sort((a,b) => {
            const nameA = (typeof a.exercise === 'object' && a.exercise !== null) ? a.exercise.name : '';
            const nameB = (typeof b.exercise === 'object' && b.exercise !== null) ? b.exercise.name : '';
            return (nameA + a.gender).localeCompare(nameB + b.gender);
          });
          this.editMode = true;
          this.currentStandardId = savedStandard._id;
        }
        setTimeout(() => this.submitSuccess = false, 4000);
      },
      error: (err) => {
        this.error = err.error?.message || (this.editMode ? 'Error al actualizar el estándar.' : 'Error al crear el estándar. Verifica si ya existe para este ejercicio y género.');
        this.loading = false;
      },
    });
  }
  
  forceCreateMode(): void {
    this.resetRatiosForm(false);
    this.editMode = false;
    this.currentStandardId = null;
    this.submitSuccess = false;
    this.error = '';
    this.standardForm.get('ratios')?.markAsPristine();
    this.standardForm.get('ratios')?.markAsUntouched();
  }

  resetForm(): void {
    this.standardForm.reset({
      exercise: '',
      gender: 'male',
      ratios: this.strengthLevelsDef.reduce((acc, level) => ({ ...acc, [level.key]: '' }), {})
    });
    this.editMode = false;
    this.currentStandardId = null;
    this.submitSuccess = false;
    this.error = '';
  }
  
  resetRatiosForm(resetExerciseAndGender = true): void {
    const defaultRatios: { [key: string]: string | null } = {};
    this.strengthLevelsDef.forEach(level => {
      defaultRatios[level.key] = '';
    });
    
    if (resetExerciseAndGender) {
        this.standardForm.reset({
            exercise: this.f['exercise'].value || '', 
            gender: this.f['gender'].value || 'male', 
            ratios: defaultRatios
        });
    } else {
        this.ratiosFormGroup.reset(defaultRatios);
    }
  }

  getExerciseName(exerciseInput: string | Exercise | Partial<Exercise>): string {
    if (typeof exerciseInput === 'string') {
        const exercise = this.exercises.find((e) => e._id === exerciseInput);
        return exercise ? exercise.name : 'Desconocido (ID: ' + exerciseInput + ')';
    }
    return exerciseInput?.name || 'Ejercicio no especificado';
  }

  selectStandardForEditing(standard: Standard): void {
    const exerciseId = typeof standard.exercise === 'string' ? standard.exercise : (standard.exercise as Exercise)._id;
    this.standardForm.patchValue({
        exercise: exerciseId,
        gender: standard.gender
    }, { emitEvent: true }); 
    
    this.scrollToForm();
  }

  deleteStandardFromList(standardId: string): void {
    if (!confirm(`¿Estás seguro de que quieres eliminar este estándar de ratios? Esta acción no se puede deshacer.`)) {
        return;
    }
    this.loading = true;
    this.standardService.deleteStandard(standardId).subscribe({
        next: () => {
            this.loading = false;
            this.standards = this.standards.filter(s => s._id !== standardId);
            if (this.currentStandardId === standardId) {
                this.forceCreateMode();
            }
        },
        error: (err) => {
            this.loading = false;
            this.error = err.error?.message || "Error al eliminar el estándar.";
        }
    });
  }

  scrollToForm(): void {
    const formElement = document.querySelector('.admin-container .admin-card form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}