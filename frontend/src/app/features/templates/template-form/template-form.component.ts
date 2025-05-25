// frontend/src/app/features/templates/template-form/template-form.component.ts
import { Component, type OnInit, OnDestroy } from '@angular/core'; // Añadir OnDestroy si usas suscripciones
import {
  FormBuilder,
  type FormGroup,
  type FormArray,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplateService } from '../../../core/services/template.service';
import { ExerciseService } from '../../../core/services/exercise.service';
import { Exercise } from '../../../core/models/exercise.model';
import { Template } from '../../../core/models/template.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// import { Subscription } from 'rxjs'; // Si tienes suscripciones que limpiar

@Component({
  selector: 'app-template-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './template-form.component.html',
  styleUrls: ['./template-form.component.scss'],
})
export class TemplateFormComponent implements OnInit /*, OnDestroy */ {
  templateForm!: FormGroup;
  allAvailableExercises: Exercise[] = []; // Renombrado para claridad
  loading = false;
  loadingData = false; // Para la carga inicial de ejercicios y la plantilla a editar
  submitSuccess = false;
  error = '';
  editMode = false;
  templateId: string | null = null;
  filteredExercisesForSearch: Exercise[] = []; // Para el dropdown de búsqueda
  searchTerm = '';

  // private subscriptions = new Subscription(); // Si es necesario

  constructor(
    private formBuilder: FormBuilder,
    private templateService: TemplateService,
    private exerciseService: ExerciseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAvailableExercises(); // Cargar todos los ejercicios disponibles para los dropdowns

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.editMode = true;
        this.templateId = params['id'];
        this.loadTemplateForEditing(this.templateId ?? '');
      }
    });
  }

  // ngOnDestroy(): void { // Si usas this.subscriptions
  //   this.subscriptions.unsubscribe();
  // }

  initForm(): void {
    this.templateForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      // isPublic: [false], // ELIMINADO
      exercises: this.formBuilder.array([]),
    });
  }

  loadAvailableExercises(): void {
    this.loadingData = true; // Puede combinarse con loadingTemplate si se edita
    this.exerciseService.getExercises().subscribe({
      next: (data) => {
        this.allAvailableExercises = data.sort((a,b) => a.name.localeCompare(b.name));
        this.filteredExercisesForSearch = [...this.allAvailableExercises];
        // No establecer loadingData = false aquí si también estamos cargando la plantilla
        if (!this.editMode) {
            this.loadingData = false;
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar la lista de ejercicios.';
        this.loadingData = false;
      },
    });
  }

  loadTemplateForEditing(id: string): void {
    this.loadingData = true;
    this.templateService.getTemplate(id).subscribe({
      next: (template) => {
        this.patchFormWithTemplate(template);
        this.loadingData = false; // Ahora sí, después de cargar la plantilla
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar la plantilla para editar.';
        this.loadingData = false;
        this.router.navigate(['/templates']);
      },
    });
  }

  patchFormWithTemplate(template: Template): void {
    this.templateForm.patchValue({
      name: template.name,
      description: template.description,
      // isPublic: template.isPublic, // ELIMINADO
    });

    // CORRECCIÓN DEL BUG DE EDICIÓN: Limpiar el FormArray 'exercisesArray'
    while (this.exercisesArray.length !== 0) {
      this.exercisesArray.removeAt(0);
    }

    // Añadir los ejercicios de la plantilla al FormArray
    template.exercises.forEach((templateExercise) => {
      this.addExerciseToForm( // Renombrado para claridad
        (templateExercise.exercise as Exercise)?._id || (templateExercise.exercise as unknown as string), // Manejar si exercise es objeto o ID
        templateExercise.sets,
        templateExercise.reps,
        templateExercise.restTime,
        templateExercise.notes
      );
    });
  }

  get f() {
    return this.templateForm.controls;
  }

  get exercisesArray() {
    return this.f['exercises'] as FormArray;
  }

  // Método para crear el FormGroup de un ejercicio
  createExerciseGroup(
    exerciseId?: string,
    sets?: number,
    reps?: number,
    restTime?: number,
    notes?: string
  ): FormGroup {
    return this.formBuilder.group({
      exercise: [exerciseId || '', Validators.required],
      sets: [sets || 3, [Validators.required, Validators.min(1)]],
      reps: [reps || 10, [Validators.required, Validators.min(1)]],
      restTime: [restTime || 60, [Validators.required, Validators.min(0)]],
      notes: [notes || ''],
    });
  }
  
  // Método para añadir un ejercicio al FormArray
  addExerciseToForm(
    exerciseId?: string,
    sets?: number,
    reps?: number,
    restTime?: number,
    notes?: string
  ): void {
    this.exercisesArray.push(
      this.createExerciseGroup(exerciseId, sets, reps, restTime, notes)
    );
  }
  
  // Para el botón "Añadir Ejercicio" en el HTML
  onAddExerciseClicked(): void {
      this.addExerciseToForm();
  }

  removeExercise(index: number): void {
    this.exercisesArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.templateForm.invalid) {
      this.templateForm.markAllAsTouched();
      this.error = "Por favor, completa todos los campos requeridos.";
      return;
    }

    this.loading = true;
    this.submitSuccess = false;
    this.error = '';

    const templateData = {
      name: this.f['name'].value,
      description: this.f['description'].value,
      // isPublic: this.f['isPublic'].value, // ELIMINADO
      exercises: this.exercisesArray.value.map((ex: any) => ({ // Asegurar estructura correcta
        exercise: ex.exercise, // Debe ser el _id del ejercicio
        sets: ex.sets,
        reps: ex.reps,
        restTime: ex.restTime,
        notes: ex.notes
      })),
    };

    const operation = this.editMode && this.templateId
      ? this.templateService.updateTemplate(this.templateId, templateData)
      : this.templateService.createTemplate(templateData);

    operation.subscribe({
      next: () => {
        this.submitSuccess = true;
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/templates']);
        }, 1500);
      },
      error: (err) => {
        this.error = err.error?.message || (this.editMode ? 'Error al actualizar la plantilla.' : 'Error al crear la plantilla.');
        this.loading = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/templates']);
  }

  // getExerciseName ya no es necesario aquí si el dropdown muestra los nombres directamente
  // y la plantilla de detalle se encarga de mostrar el nombre del ejercicio.

  onSearchChange(eventTarget: EventTarget | null, exerciseIndex: number): void {
    const searchTerm = (eventTarget as HTMLInputElement)?.value || '';
    // Esta búsqueda es para un dropdown específico de un ejercicio, no un filtro global aquí.
    // La lógica de `filteredExercisesForSearch` debe ser manejada de forma diferente si cada
    // fila de ejercicio tiene su propio buscador/filtrador.
    // Por simplicidad, el dropdown de ejercicio en cada fila usará `allAvailableExercises`.
    // El `searchTerm` y `filteredExercisesForSearch` globales son para un filtro general si lo hubiera.
    // Dado el HTML, parece que cada fila tiene su propio select. El [(ngModel)]="searchTerm" global no aplica bien ahí.
    // Voy a eliminar el filtro en el TS por ahora y asumir que el <select> usa allAvailableExercises.
    // Si quieres un buscador por cada <select> de ejercicio, la lógica es más compleja.
  }
}