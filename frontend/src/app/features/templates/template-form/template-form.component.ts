import { Component, type OnInit, OnDestroy } from '@angular/core'; 
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

@Component({
  selector: 'app-template-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './template-form.component.html',
  styleUrls: ['./template-form.component.scss'],
})
export class TemplateFormComponent implements OnInit /*, OnDestroy */ {
  templateForm!: FormGroup;
  allAvailableExercises: Exercise[] = []; 
  loading = false;
  loadingData = false;
  submitSuccess = false;
  error = '';
  editMode = false;
  templateId: string | null = null;
  filteredExercisesForSearch: Exercise[] = []; 
  searchTerm = '';


  constructor(
    private formBuilder: FormBuilder,
    private templateService: TemplateService,
    private exerciseService: ExerciseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAvailableExercises(); 

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.editMode = true;
        this.templateId = params['id'];
        this.loadTemplateForEditing(this.templateId ?? '');
      }
    });
  }


  initForm(): void {
    this.templateForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      exercises: this.formBuilder.array([]),
    });
  }

  loadAvailableExercises(): void {
    this.loadingData = true; 
    this.exerciseService.getExercises().subscribe({
      next: (data) => {
        this.allAvailableExercises = data.sort((a,b) => a.name.localeCompare(b.name));
        this.filteredExercisesForSearch = [...this.allAvailableExercises];
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
        this.loadingData = false;
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
    });

    while (this.exercisesArray.length !== 0) {
      this.exercisesArray.removeAt(0);
    }

    template.exercises.forEach((templateExercise) => {
      this.addExerciseToForm( 
        (templateExercise.exercise as Exercise)?._id || (templateExercise.exercise as unknown as string),
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
      exercises: this.exercisesArray.value.map((ex: any) => ({ 
        exercise: ex.exercise, 
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



  onSearchChange(eventTarget: EventTarget | null, exerciseIndex: number): void {
    const searchTerm = (eventTarget as HTMLInputElement)?.value || '';
    //
  }
}