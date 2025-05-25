import { Component, type OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'; // Validators ya no es tan necesario aquí
import { StandardService } from '../../../core/services/standard.service';
import { ExerciseService } from '../../../core/services/exercise.service';
import { Exercise } from '../../../core/models/exercise.model';
import { Standard, StrengthLevelRatios } from '../../../core/models/standard.model';
import { CommonModule, TitleCasePipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Subscription, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';

interface DynamicTableRow {
  bodyWeight: number;
  levels: StrengthLevelRatios; 
}

@Component({
  selector: 'app-standards-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TitleCasePipe, DecimalPipe],
  templateUrl: './standards-view.component.html',
  styleUrls: ['./standards-view.component.scss'],
  providers: [TitleCasePipe, DecimalPipe]
})
export class StandardsViewComponent implements OnInit, OnDestroy {
  allExercises: Exercise[] = [];
  allStandards: Standard[] = [];
  filteredAndSortedStandards: Standard[] = [];
  
  filterForm!: FormGroup; 
  
  activeStandardForTable: Standard | null = null;
  dynamicTableRows: DynamicTableRow[] = [];
  
  private bodyWeightRanges = {
    male: { start: 50, end: 140, step: 5 },
    female: { start: 40, end: 120, step: 5 }
  };

  loading = false;
  error = '';
  
  readonly strengthLevelKeys: Array<keyof StrengthLevelRatios> = ['principiante', 'novato', 'intermedio', 'avanzado', 'elite'];
  readonly strengthLevelLabels: Record<keyof StrengthLevelRatios, string> = {
    principiante: 'Principiante', novato: 'Novato', intermedio: 'Intermedio',
    avanzado: 'Avanzado', elite: 'Élite',
  };

  private subscriptions = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private standardService: StandardService,
    private exerciseService: ExerciseService
  ) {}

  ngOnInit(): void {
    this.initFilterForm();
    this.loadInitialData();
    this.setupFilterFormListeners();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initFilterForm(): void {
    this.filterForm = this.formBuilder.group({
        searchTerm: [''],
        displayGender: ['male'] 
    });
  }

  setupFilterFormListeners(): void {
    const filterSub = combineLatest([
        this.filterForm.get('searchTerm')!.valueChanges.pipe(startWith(this.filterForm.get('searchTerm')?.value || ''), debounceTime(300), distinctUntilChanged()),
        this.filterForm.get('displayGender')!.valueChanges.pipe(startWith(this.filterForm.get('displayGender')?.value || 'male'), distinctUntilChanged())
    ]).subscribe(([searchTerm, displayGender]) => {
        this.applyFiltersAndSort(searchTerm, displayGender);
        
        if (this.activeStandardForTable) {
            const currentActiveTableExerciseId = (this.activeStandardForTable.exercise as Exercise)?._id;

            // Verificar si el género del estándar activo es diferente al género del filtro Y si tenemos un ID de ejercicio activo
            if (this.activeStandardForTable.gender !== displayGender && currentActiveTableExerciseId) {
                // El género ha cambiado, intentamos encontrar el estándar para el nuevo género pero MISMO ejercicio
                const newActiveStandard = this.allStandards.find(s => {
                    // CORRECCIÓN AQUÍ: Acceder de forma segura a s.exercise._id
                    const standardExerciseId = s.exercise?._id;
                    return standardExerciseId === currentActiveTableExerciseId && s.gender === displayGender;
                });
                this.setActiveStandardForTable(newActiveStandard || null);
            } else if (this.activeStandardForTable.gender === displayGender) {
                // El género no cambió, pero el término de búsqueda sí pudo haberlo hecho.
                // Verificamos si el estándar activo actual sigue estando en la lista filtrada.
                const isActiveStandardStillFiltered = this.filteredAndSortedStandards.some(
                    std => std._id === this.activeStandardForTable?._id
                );
                if (isActiveStandardStillFiltered) {
                     this.generateDynamicTable(); // El estándar activo sigue siendo válido, regenerar tabla.
                } else {
                    this.setActiveStandardForTable(null); // El estándar activo ya no está en la lista filtrada, deseleccionar.
                }
            }

            else if (this.activeStandardForTable.gender !== displayGender && !currentActiveTableExerciseId) {
                 this.setActiveStandardForTable(null);
            }
        }
    });
    this.subscriptions.add(filterSub);
  }

  loadInitialData(): void {
    this.loading = true;
    this.error = '';
    Promise.all([
      this.exerciseService.getExercises().toPromise(),
      this.standardService.getStandards().toPromise(),
    ])
    .then(([exercisesData, standardsData]) => {
      this.allExercises = (exercisesData || [])
                            .filter(ex => ex.isPowerlifting || ex.exerciseType === 'compound')
                            .sort((a,b) => a.name.localeCompare(b.name));
      
      this.allStandards = (standardsData || []).map((s_raw: any) => {
        const s = s_raw as Standard;
        let exerciseIdFromStandard: string | undefined;

        if (s.exercise && typeof s.exercise === 'object' && (s.exercise as any)._id) {
          exerciseIdFromStandard = (s.exercise as any)._id;
        } else if (typeof s.exercise === 'string') {
          exerciseIdFromStandard = s.exercise;
        }

        const fullExerciseObject = exerciseIdFromStandard
          ? this.allExercises.find(ex => ex._id === exerciseIdFromStandard)
          : undefined;

        return { ...s, exercise: fullExerciseObject || s.exercise };
      })
      .sort((a, b) => {
        const nameA = (typeof a.exercise === 'object' && a.exercise !== null) ? (a.exercise as Exercise).name : '';
        const nameB = (typeof b.exercise === 'object' && b.exercise !== null) ? (b.exercise as Exercise).name : '';
        return (nameA + a.gender).localeCompare(nameB + b.gender);
      });
      
      this.applyFiltersAndSort(this.filterForm.get('searchTerm')?.value || '', this.filterForm.get('displayGender')?.value || 'male');
      this.loading = false;
    })
    .catch((err) => {
      this.error = err.error?.message || 'Error al cargar datos iniciales.';
      this.loading = false;
    });
  }
  
  applyFiltersAndSort(searchTerm: string, displayGender: string): void {
    const lowerSearchTerm = searchTerm.toLowerCase();
    this.filteredAndSortedStandards = this.allStandards
        .filter(s => {
            const exerciseName = ((s.exercise as Exercise)?.name || '').toLowerCase();
            return s.gender === displayGender && exerciseName.includes(lowerSearchTerm);
        })
        .sort((a, b) => (((a.exercise as Exercise)?.name || '').localeCompare(((b.exercise as Exercise)?.name || ''))));
    
    if (this.activeStandardForTable && !this.filteredAndSortedStandards.some(std => std._id === this.activeStandardForTable?._id)) {
        if(this.activeStandardForTable.gender !== displayGender){ 
             this.setActiveStandardForTable(null);
        }
    }
  }

  setActiveStandardForTable(standard: Standard | null): void {
    this.activeStandardForTable = standard;
    this.generateDynamicTable();
  }

  generateDynamicTable(): void {
    if (!this.activeStandardForTable || !this.activeStandardForTable.ratios) {
      this.dynamicTableRows = [];
      return;
    }
    const newTableRows: DynamicTableRow[] = [];
    const ratios = this.activeStandardForTable.ratios;
    const currentGender = this.activeStandardForTable.gender as keyof typeof this.bodyWeightRanges;
    const range = this.bodyWeightRanges[currentGender] || this.bodyWeightRanges.male;

    for (let bw = range.start; bw <= range.end; bw += range.step) {
      const calculatedRow: StrengthLevelRatios = {} as StrengthLevelRatios; // Inicializar como objeto vacío
      this.strengthLevelKeys.forEach(key => {
        calculatedRow[key] = bw * ratios[key];
      });
      newTableRows.push({ bodyWeight: bw, levels: calculatedRow });
    }
    this.dynamicTableRows = newTableRows;
  }

  getExerciseNameFromStd(standardOrExercise: Standard | Exercise | string | undefined | null): string {
    if (!standardOrExercise) return 'Desconocido';
    if (typeof standardOrExercise === 'string') { // Es un ID
        const exercise = this.allExercises.find((e) => e._id === standardOrExercise);
        return exercise ? exercise.name : 'ID: ' + standardOrExercise;
    }
    // Es un objeto Standard o Exercise
    const exerciseObj = (standardOrExercise as Standard).exercise || standardOrExercise;
    if (typeof exerciseObj === 'string') { // El campo exercise es un ID
         const exercise = this.allExercises.find((e) => e._id === exerciseObj);
        return exercise ? exercise.name : 'ID: ' + exerciseObj;
    }
    return (exerciseObj as Exercise)?.name || 'Nombre Desconocido';
  }
}