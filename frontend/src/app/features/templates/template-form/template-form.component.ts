import { Component, type OnInit } from '@angular/core';
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
export class TemplateFormComponent implements OnInit {
  templateForm!: FormGroup;
  exercises: Exercise[] = [];
  loading = false;
  loadingData = false;
  submitSuccess = false;
  error = '';
  editMode = false;
  templateId: string | null = null;
  filteredExercises: Exercise[] = [];
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
    this.loadExercises();

    // Check if we're in edit mode
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.editMode = true;
        this.templateId = params['id'];
        this.loadTemplate(this.templateId ?? '');
      }
    });
  }

  initForm(): void {
    this.templateForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      isPublic: [false],
      exercises: this.formBuilder.array([]),
    });
  }

  loadExercises(): void {
    this.loadingData = true;
    this.exerciseService.getExercises().subscribe({
      next: (data) => {
        this.exercises = data;
        this.filteredExercises = [...this.exercises];
        this.loadingData = false;
      },
      error: (error) => {
        this.error = error.error.message || 'Failed to load exercises';
        this.loadingData = false;
      },
    });
  }

  loadTemplate(id: string): void {
    this.loadingData = true;
    this.templateService.getTemplate(id).subscribe({
      next: (template) => {
        this.patchFormWithTemplate(template);
        this.loadingData = false;
      },
      error: (error) => {
        this.error = error.error.message || 'Failed to load template';
        this.loadingData = false;
        this.router.navigate(['/templates']);
      },
    });
  }

  patchFormWithTemplate(template: Template): void {
    this.templateForm.patchValue({
      name: template.name,
      description: template.description,
      isPublic: template.isPublic,
    });

    // Clear existing exercises
    while (this.exercises.length) {
      this.removeExercise(0);
    }

    // Add exercises from template
    template.exercises.forEach((exercise) => {
      this.addExercise(
        exercise.exercise._id,
        exercise.sets,
        exercise.reps,
        exercise.restTime,
        exercise.notes
      );
    });
  }

  // Convenience getters
  get f() {
    return this.templateForm.controls;
  }

  get exercisesArray() {
    return this.f['exercises'] as FormArray;
  }

  addExercise(
    exerciseId?: string,
    sets?: number,
    reps?: number,
    restTime?: number,
    notes?: string
  ): void {
    const exerciseGroup = this.formBuilder.group({
      exercise: [exerciseId || '', Validators.required],
      sets: [sets || 3, [Validators.required, Validators.min(1)]],
      reps: [reps || 10, [Validators.required, Validators.min(1)]],
      restTime: [restTime || 60, [Validators.required, Validators.min(0)]],
      notes: [notes || ''],
    });

    this.exercisesArray.push(exerciseGroup);
  }

  removeExercise(index: number): void {
    this.exercisesArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.templateForm.invalid) {
      return;
    }

    this.loading = true;
    this.submitSuccess = false;
    this.error = '';

    const templateData = {
      name: this.f['name'].value,
      description: this.f['description'].value,
      isPublic: this.f['isPublic'].value,
      exercises: this.exercisesArray.value,
    };

    if (this.editMode && this.templateId) {
      this.templateService
        .updateTemplate(this.templateId, templateData)
        .subscribe({
          next: () => {
            this.submitSuccess = true;
            this.loading = false;
            setTimeout(() => {
              this.router.navigate(['/templates']);
            }, 1500);
          },
          error: (error) => {
            this.error = error.error.message || 'Failed to update template';
            this.loading = false;
          },
        });
    } else {
      this.templateService.createTemplate(templateData).subscribe({
        next: () => {
          this.submitSuccess = true;
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/templates']);
          }, 1500);
        },
        error: (error) => {
          this.error = error.error.message || 'Failed to create template';
          this.loading = false;
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/templates']);
  }

  getExerciseName(exerciseId: string): string {
    const exercise = this.exercises.find((e) => e._id === exerciseId);
    return exercise ? exercise.name : '';
  }

  onSearchChange(): void {
    if (!this.searchTerm.trim()) {
      this.filteredExercises = [...this.exercises];
    } else {
      const search = this.searchTerm.toLowerCase().trim();
      this.filteredExercises = this.exercises.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(search) ||
          exercise.muscleGroup.toLowerCase().includes(search) ||
          exercise.movementType.toLowerCase().includes(search)
      );
    }
  }
}
