import { Component, type OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, type FormGroup, Validators } from '@angular/forms';
import { CalculatorService } from '../../../core/services/calculator.service';
import { ExerciseService } from '../../../core/services/exercise.service';
import { StandardService } from '../../../core/services/standard.service'; 
import { AuthService } from '../../../core/services/auth.service'; 
import { Exercise } from '../../../core/models/exercise.model';
import { Standard, StrengthLevelRatios } from '../../../core/models/standard.model';
import { User } from '../../../core/models/user.model'; 
import { CommonModule, TitleCasePipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

interface StrengthCalculationResult {
  userEstimated1RM: number;
  determinedStrengthLevel: string; 
  percentageToNextLevel: number;
  targetKgsPerLevel: StrengthLevelRatios;
  nextLevelLabel?: string; 
  selectedExerciseName: string;
  userBodyWeightForCalc: number;
  userGenderForCalc: string;
}

@Component({
  selector: 'app-exercise-strength-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe],
  templateUrl: './exercise-strength-calculator.component.html',
  styleUrls: ['./exercise-strength-calculator.component.scss'],
  providers: [DecimalPipe]
})
export class ExerciseStrengthCalculatorComponent implements OnInit, OnDestroy {
  calculatorForm!: FormGroup;
  exercises: Exercise[] = []; 
  allStandards: Standard[] = []; 
  currentUser: User | null = null;
  
  loading = false;
  loadingInitialData = false; 
  error = '';
  result: StrengthCalculationResult | null = null;

  private authSubscription?: Subscription;

  readonly strengthLevelKeys: Array<keyof StrengthLevelRatios> = ['principiante', 'novato', 'intermedio', 'avanzado', 'elite'];
  readonly strengthLevelLabels: Record<keyof StrengthLevelRatios, string> = {
    principiante: 'Principiante',
    novato: 'Novato',
    intermedio: 'Intermedio',
    avanzado: 'Avanzado',
    elite: 'Élite',
  };

  constructor(
    private formBuilder: FormBuilder,
    private calculatorService: CalculatorService,
    private exerciseService: ExerciseService,
    private standardService: StandardService, 
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();

    this.authSubscription = this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.calculatorForm.patchValue({
          bodyWeight: user.weight || '',
          gender: user.gender || 'male',
        });
        if (user.weight) this.calculatorForm.get('bodyWeight')?.disable();
        if (user.gender) this.calculatorForm.get('gender')?.disable();
      } else {
        this.calculatorForm.get('bodyWeight')?.enable();
        this.calculatorForm.get('gender')?.enable();
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  initForm(): void {
    this.calculatorForm = this.formBuilder.group({
      exercise: ['', Validators.required],
      weight: ['', [Validators.required, Validators.min(0.1)]],
      reps: ['', [Validators.required, Validators.min(1), Validators.max(36)]],
      bodyWeight: ['', [Validators.required, Validators.min(20), Validators.max(300)]],
      gender: ['male', Validators.required],
    });
  }

  loadInitialData(): void {
    this.loadingInitialData = true;
    Promise.all([
      this.exerciseService.getExercises().toPromise(),
      this.standardService.getStandards().toPromise(),
    ])
    .then(([exercisesData, standardsData]) => {
      this.allStandards = standardsData || [];
      
      const exerciseIdArray: string[] = this.allStandards
        .map(s => {
          if (s.exercise && typeof s.exercise === 'object' && (s.exercise as Exercise)._id) {
            return (s.exercise as Exercise)._id;
          }
          return null; 
        })
        .filter(id => id !== null) as string[]; 

      const exercisesWithStandardsIds = new Set(exerciseIdArray); 
      
      this.exercises = (exercisesData || [])
        .filter(ex => exercisesWithStandardsIds.has(ex._id) && (ex.isPowerlifting || ex.exerciseType === 'compound'))
        .sort((a,b) => a.name.localeCompare(b.name));
      
      this.loadingInitialData = false;
    })
    .catch((err) => {
      this.error = err.error?.message || 'Error al cargar datos iniciales.';
      this.loadingInitialData = false;
    });
  }

  get f() {
    return this.calculatorForm.controls;
  }

  onSubmit(): void {
    if (this.calculatorForm.invalid) {
      this.calculatorForm.markAllAsTouched();
      this.error = "Por favor, completa todos los campos requeridos.";
      this.result = null;
      return;
    }

    this.loading = true;
    this.result = null;
    this.error = '';

    const formValues = this.calculatorForm.getRawValue(); 
    const exerciseId = formValues.exercise;
    const weight = parseFloat(formValues.weight);
    const reps = parseInt(formValues.reps, 10);
    const bodyWeight = parseFloat(formValues.bodyWeight);
    const gender = formValues.gender;

    this.calculatorService.calculate1RM(weight, reps).subscribe({
      next: (oneRMData) => {
        const userEstimated1RM = oneRMData.oneRM;
        this.processWithStandards(userEstimated1RM, exerciseId, bodyWeight, gender);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al calcular el 1RM.';
        this.loading = false;
      }
    });
  }

  processWithStandards(user1RM: number, exerciseId: string, userBodyWeight: number, userGender: string): void {
    const selectedExercise = this.exercises.find(ex => ex._id === exerciseId);
    if (!selectedExercise) {
      this.error = "Ejercicio seleccionado no encontrado.";
      this.loading = false;
      return;
    }

    const relevantStandard = this.allStandards.find(s => {

      const standardExerciseObject = s.exercise; 
      if (standardExerciseObject && typeof standardExerciseObject === 'object' && standardExerciseObject._id) {
        return standardExerciseObject._id === exerciseId && s.gender === userGender;
      }
      return false;
    });

    if (!relevantStandard || !relevantStandard.ratios) {
      this.error = `No se encontraron estándares de ratios definidos para "${selectedExercise.name}" y género "${userGender === 'male' ? 'Masculino' : 'Femenino'}".`;
      this.loading = false;
      this.result = null; 
      return;
    }

    if (!relevantStandard || !relevantStandard.ratios) {
      this.error = `No se encontraron estándares de ratios definidos para "${selectedExercise.name}" y género "${userGender === 'male' ? 'Masculino' : 'Femenino'}".`;
      this.loading = false;
      return;
    }

    const targetKgsPerLevel = {} as StrengthLevelRatios;
    this.strengthLevelKeys.forEach(key => {
      targetKgsPerLevel[key] = userBodyWeight * relevantStandard.ratios[key];
    });

    let determinedLevelKey: keyof StrengthLevelRatios | null = null;
    for (let i = this.strengthLevelKeys.length - 1; i >= 0; i--) {
      const key = this.strengthLevelKeys[i];
      if (user1RM >= targetKgsPerLevel[key]) {
        determinedLevelKey = key;
        break;
      }
    }

    let percentageToNext = 0;
    let nextLevelLabel = '';

    if (determinedLevelKey) {
      const currentIndex = this.strengthLevelKeys.indexOf(determinedLevelKey);
      if (determinedLevelKey === 'elite') {
        percentageToNext = 100;
        nextLevelLabel = 'Élite+';
      } else {
        const currentLevelWeight = targetKgsPerLevel[determinedLevelKey];
        const nextLevelKey = this.strengthLevelKeys[currentIndex + 1];
        nextLevelLabel = this.strengthLevelLabels[nextLevelKey];
        const nextLevelWeight = targetKgsPerLevel[nextLevelKey];
        
        if (nextLevelWeight > currentLevelWeight) { 
          percentageToNext = ((user1RM - currentLevelWeight) / (nextLevelWeight - currentLevelWeight)) * 100;
        } else if (user1RM >= nextLevelWeight) {
            percentageToNext = 100;
        }
        percentageToNext = Math.max(0, Math.min(percentageToNext, 100)); 
      }
    } else { 
        nextLevelLabel = this.strengthLevelLabels.principiante;
        const beginnerTarget = targetKgsPerLevel.principiante;
        if (beginnerTarget > 0) {
            percentageToNext = (user1RM / beginnerTarget) * 100;
            percentageToNext = Math.max(0, Math.min(percentageToNext, 100));
        }
    }

    this.result = {
      userEstimated1RM: user1RM,
      determinedStrengthLevel: determinedLevelKey ? this.strengthLevelLabels[determinedLevelKey] : 'Por debajo de Principiante',
      percentageToNextLevel: percentageToNext,
      targetKgsPerLevel: targetKgsPerLevel,
      nextLevelLabel: nextLevelLabel,
      selectedExerciseName: selectedExercise.name,
      userBodyWeightForCalc: userBodyWeight,
      userGenderForCalc: userGender
    };
    this.loading = false;
  }
}