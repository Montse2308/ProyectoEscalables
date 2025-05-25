import { Component, type OnInit, LOCALE_ID, Inject } from '@angular/core'; // Importar LOCALE_ID, Inject
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Añadir Validators
import { StandardService } from '../../../core/services/standard.service';
import { ExerciseService } from '../../../core/services/exercise.service';
import { AuthService } from '../../../core/services/auth.service';
import { Exercise } from '../../../core/models/exercise.model';
import { Standard, StrengthLevelRatios } from '../../../core/models/standard.model'; // Usar el modelo Standard actualizado
import { User } from '../../../core/models/user.model';
import { CommonModule, TitleCasePipe, DecimalPipe } from '@angular/common'; // Añadir DecimalPipe
import { ReactiveFormsModule } from '@angular/forms';

// Para registrar el locale 'es' si no está globalmente
// import { registerLocaleData } from '@angular/common';
// import localeEs from '@angular/common/locales/es';
// registerLocaleData(localeEs, 'es');

interface CalculatedStrengthLevel {
  level: keyof StrengthLevelRatios;
  targetWeight: number;
  isCurrentUserLevel?: boolean;
}

@Component({
  selector: 'app-standards-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TitleCasePipe, DecimalPipe], // Añadir TitleCasePipe, DecimalPipe
  templateUrl: './standards-view.component.html',
  styleUrls: ['./standards-view.component.scss'],
  providers: [TitleCasePipe, DecimalPipe] // Proveer pipes si se usan en el TS o internamente
})
export class StandardsViewComponent implements OnInit {
  standardsForm!: FormGroup;
  exercises: Exercise[] = []; // Solo ejercicios para los que hay estándares o que sean relevantes
  allStandards: Standard[] = []; // Todos los estándares cargados
  loading = false;
  error = '';
  
  currentUser: User | null = null;
  userBodyWeight = 0; // Peso corporal del usuario actual
  
  selectedExerciseId: string | null = null;
  userSubmittedOneRM: number | null = null;
  
  // Resultados para mostrar
  currentUserLevel: string | null = null; // 'principiante', 'novato', etc.
  currentUserPercentageToNext: number | null = null;
  calculatedLevelsForUser: CalculatedStrengthLevel[] = []; // Tabla de niveles en KG para el usuario
  
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
    private standardService: StandardService,
    private exerciseService: ExerciseService,
    private authService: AuthService,
    private titleCasePipe: TitleCasePipe,
    @Inject(LOCALE_ID) private locale: string // Inyectar locale
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
    
    this.authService.currentUser.subscribe(user => {
        this.currentUser = user;
        this.userBodyWeight = this.currentUser?.weight || 0;
        // Si el formulario ya tiene valores, recalcular si cambia el usuario (peso/género)
        if (this.standardsForm.valid && this.selectedExerciseId) {
            this.displayUserStrengthComparison();
        }
    });
  }

  initForm(): void {
    this.standardsForm = this.formBuilder.group({
      exercise: ['', Validators.required],
      oneRM: ['', [Validators.required, Validators.min(1)]],
      // Campos opcionales para que un no autenticado ingrese sus datos
      guestGender: ['male'],
      guestBodyWeight: ['', [Validators.min(20), Validators.max(300)]]
    });

    // Si el usuario está logueado, pre-llenar y deshabilitar guestGender y guestBodyWeight
    if (this.authService.isLoggedIn()) {
        this.standardsForm.get('guestGender')?.disable();
        this.standardsForm.get('guestBodyWeight')?.disable();
    } else {
        this.standardsForm.get('guestGender')?.setValidators(Validators.required);
        this.standardsForm.get('guestBodyWeight')?.setValidators([Validators.required, Validators.min(20), Validators.max(300)]);
    }
    this.standardsForm.get('guestGender')?.updateValueAndValidity();
    this.standardsForm.get('guestBodyWeight')?.updateValueAndValidity();
  }

  loadData(): void {
    this.loading = true;
    Promise.all([
      this.exerciseService.getExercises().toPromise(), // Obtener todos los ejercicios
      this.standardService.getStandards().toPromise(), // Obtener todos los estándares
    ])
    .then(([exercisesData, standardsData]) => {
      this.allStandards = standardsData || [];
      // Filtrar ejercicios para mostrar solo aquellos que tienen estándares definidos
      const exercisesWithStandardsIds = new Set(this.allStandards.map(s => s.exercise._id || s.exercise));
      this.exercises = (exercisesData || [])
          .filter(ex => exercisesWithStandardsIds.has(ex._id) && (ex.isPowerlifting || ex.exerciseType === 'compound')) // Mostrar compuestos o de powerlifting con estándares
          .sort((a,b) => a.name.localeCompare(b.name));

      this.loading = false;
    })
    .catch((error) => {
      this.error = error.error?.message || 'Error al cargar datos para los estándares.';
      this.loading = false;
    });
  }

  onSubmit(): void {
    if (this.standardsForm.invalid) {
      this.standardsForm.markAllAsTouched();
      this.error = "Por favor, completa todos los campos requeridos.";
      this.clearResults();
      return;
    }
    this.error = '';
    this.selectedExerciseId = this.f['exercise'].value;
    this.userSubmittedOneRM = parseFloat(this.f['oneRM'].value);
    this.displayUserStrengthComparison();
  }

  displayUserStrengthComparison(): void {
    if (!this.selectedExerciseId || this.userSubmittedOneRM === null) {
      this.clearResults();
      return;
    }

    let currentGender: string;
    let currentBodyWeight: number;

    if (this.currentUser) {
        currentGender = this.currentUser.gender || 'male';
        currentBodyWeight = this.currentUser.weight || 0;
    } else {
        currentGender = this.f['guestGender'].value;
        currentBodyWeight = parseFloat(this.f['guestBodyWeight'].value);
        if (isNaN(currentBodyWeight) || currentBodyWeight <=0) {
            this.error = "Por favor, ingresa un peso corporal válido.";
            this.clearResults();
            return;
        }
    }
    this.userBodyWeight = currentBodyWeight; // Actualizar para la tabla

    const standardForExercise = this.allStandards.find(
      (s) => (s.exercise._id || s.exercise) === this.selectedExerciseId && s.gender === currentGender
    );

    if (!standardForExercise || !standardForExercise.ratios) {
      this.error = `No se encontraron estándares de ratios para este ejercicio y género (${currentGender}).`;
      this.clearResults();
      return;
    }

    this.calculatedLevelsForUser = [];
    let userLevelKey: keyof StrengthLevelRatios | null = null;
    let nextLevelKey: keyof StrengthLevelRatios | null = null;
    let previousLevelWeight = 0;

    // Calcular pesos absolutos para cada nivel basado en ratios y peso corporal del usuario
    for (const key of this.strengthLevelKeys) {
        const ratio = standardForExercise.ratios[key];
        const targetWeight = currentBodyWeight * ratio;
        this.calculatedLevelsForUser.push({ level: key, targetWeight });

        if (this.userSubmittedOneRM >= targetWeight) {
            userLevelKey = key;
            previousLevelWeight = targetWeight; // Peso del nivel actual o superado
        }
    }
    
    this.currentUserLevel = userLevelKey ? this.strengthLevelLabels[userLevelKey] : "Por debajo de Principiante";

    // Calcular porcentaje al siguiente nivel
    if (userLevelKey && userLevelKey !== 'elite') {
        const currentIndex = this.strengthLevelKeys.indexOf(userLevelKey);
        nextLevelKey = this.strengthLevelKeys[currentIndex + 1];
        const nextLevelTargetWeight = this.calculatedLevelsForUser.find(l => l.level === nextLevelKey)?.targetWeight || 0;
        
        if (nextLevelTargetWeight > previousLevelWeight) { // Evitar división por cero si los pesos son iguales
            const progressInCurrentRange = this.userSubmittedOneRM - previousLevelWeight;
            const rangeToNextLevel = nextLevelTargetWeight - previousLevelWeight;
            this.currentUserPercentageToNext = (progressInCurrentRange / rangeToNextLevel) * 100;
            if (this.currentUserPercentageToNext > 100) this.currentUserPercentageToNext = 100;
            if (this.currentUserPercentageToNext < 0) this.currentUserPercentageToNext = 0;
        } else if (this.userSubmittedOneRM >= nextLevelTargetWeight) {
            this.currentUserPercentageToNext = 100; // Ya alcanzó o superó el siguiente nivel
        } else {
            this.currentUserPercentageToNext = 0;
        }
    } else if (userLevelKey === 'elite') {
        this.currentUserPercentageToNext = 100; // Ya es élite
    } else { // Por debajo de principiante
        const beginnerWeight = this.calculatedLevelsForUser.find(l => l.level === 'principiante')?.targetWeight || 0;
        if (beginnerWeight > 0) {
            this.currentUserPercentageToNext = (this.userSubmittedOneRM / beginnerWeight) * 100;
             if (this.currentUserPercentageToNext > 100) this.currentUserPercentageToNext = 100;
             if (this.currentUserPercentageToNext < 0) this.currentUserPercentageToNext = 0;
        } else {
            this.currentUserPercentageToNext = 0;
        }
    }

    // Marcar el nivel actual del usuario en la tabla
    this.calculatedLevelsForUser.forEach(level => {
        level.isCurrentUserLevel = level.level === userLevelKey;
    });
  }
  
  clearResults(): void {
    this.currentUserLevel = null;
    this.currentUserPercentageToNext = null;
    this.calculatedLevelsForUser = [];
    // No limpiar selectedExerciseId y userSubmittedOneRM para que el usuario no tenga que reingresar todo
  }

  get f() {
    return this.standardsForm.controls;
  }

  getSelectedExerciseName(): string {
    if (!this.selectedExerciseId) return 'N/A';
    const exercise = this.exercises.find(e => e._id === this.selectedExerciseId);
    return exercise ? exercise.name : 'Desconocido';
  }

  getNextLevelLabel(): string {
    if (!this.currentUserLevel || this.currentUserLevel.toLowerCase() === 'élite') return 'Élite+';
    const currentKey = this.strengthLevelKeys.find(k => this.strengthLevelLabels[k] === this.currentUserLevel);
    if (currentKey) {
        const currentIndex = this.strengthLevelKeys.indexOf(currentKey);
        if (currentIndex < this.strengthLevelKeys.length -1) {
            return this.strengthLevelLabels[this.strengthLevelKeys[currentIndex + 1]];
        }
    }
    if (this.currentUserLevel === "Por debajo de Principiante") return "Principiante";
    return '';
  }
}