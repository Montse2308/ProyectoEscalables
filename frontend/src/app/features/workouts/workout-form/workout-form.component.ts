import { Component, type OnInit } from '@angular/core';
import { FormBuilder, type FormGroup, type FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from '../../../core/services/workout.service';
import { ExerciseService } from '../../../core/services/exercise.service';
import { Exercise } from '../../../core/models/exercise.model';
import { Workout, ExercisePerformed, Set as WorkoutSet } from '../../../core/models/workout.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router';
import { Template } from '../../../core/models/template.model'; 

@Component({
  selector: 'app-workout-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './workout-form.component.html',
  styleUrls: ['./workout-form.component.scss'],
})
export class WorkoutFormComponent implements OnInit {
  workoutForm!: FormGroup;
  allAvailableExercises: Exercise[] = [];
  loading = false;
  loadingData = false;
  submitSuccess = false;
  error = '';
  editMode = false;
  workoutId: string | null = null;
  isCompleting = false;
  workoutFromTemplateData: Template | null = null; 

  constructor(
    private formBuilder: FormBuilder,
    private workoutService: WorkoutService,
    private exerciseService: ExerciseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAvailableExercises();

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.workoutId = params['id'];
        if (this.router.getCurrentNavigation()?.extras.state?.['templateData']) {
          this.editMode = true; 
          const template = this.router.getCurrentNavigation()?.extras.state?.['templateData'] as Template;
          const workoutShell = this.router.getCurrentNavigation()?.extras.state?.['workoutShell'] as Workout;
          this.workoutId = workoutShell._id;
          this.patchFormWithTemplateData(template, workoutShell);
        } else {
          this.editMode = true;
          if (this.workoutId) {
            this.loadWorkoutForEditing(this.workoutId);
          }
        }
      } else {
        this.editMode = false;
        if (this.exercisesArray.length === 0) {
          this.onAddExerciseClicked();
        }
      }
    });
  }

  initForm(): void {
    this.workoutForm = this.formBuilder.group({
      name: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      notes: [''],
      exercises: this.formBuilder.array([]),
    });
  }

  loadAvailableExercises(): void {
    if (!this.editMode || !this.workoutId) {
       this.loadingData = true;
    }
    this.exerciseService.getExercises().subscribe({
      next: (data) => {
        this.allAvailableExercises = data.sort((a,b) => a.name.localeCompare(b.name));
        if (!this.editMode || !this.workoutId || (this.editMode && !this.loadingData) ) { 
            this.loadingData = false;
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar la lista de ejercicios.';
        this.loadingData = false;
      },
    });
  }

  loadWorkoutForEditing(id: string): void {
    this.loadingData = true;
    this.workoutService.getWorkout(id).subscribe({
      next: (workout) => {
        this.patchFormWithExistingWorkout(workout);
        this.loadingData = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar el entrenamiento para editar.';
        this.loadingData = false;
        this.router.navigate(['/workouts']);
      },
    });
  }

  patchFormWithTemplateData(template: Template, workoutShell: Workout): void {
    this.workoutForm.patchValue({
      name: workoutShell.name, 
      date: new Date(workoutShell.date).toISOString().split('T')[0],
      notes: template.description || '', 
    });
    this.workoutFromTemplateData = template;

    while (this.exercisesArray.length !== 0) { this.exercisesArray.removeAt(0); }

    template.exercises.forEach(templateExercise => {
      const exerciseId = (templateExercise.exercise as Exercise)?._id || ((templateExercise.exercise as unknown) as string);
      const exerciseGroup = this.createExerciseGroup(exerciseId);
      this.exercisesArray.push(exerciseGroup);
      
      const setsArray = exerciseGroup.get('sets') as FormArray;
      for (let i = 0; i < templateExercise.sets; i++) {
        setsArray.push(this.createSetGroup(templateExercise.reps, undefined, templateExercise.restTime, templateExercise.notes));
      }
    });
    this.loadingData = false;
  }


  patchFormWithExistingWorkout(workout: Workout): void {
    this.workoutForm.patchValue({
      name: workout.name,
      date: new Date(workout.date).toISOString().split('T')[0],
      notes: workout.notes,
    });
    if (workout.fromTemplate) {
        this.workoutFromTemplateData = workout.fromTemplate as any; 
    }


    while (this.exercisesArray.length !== 0) { this.exercisesArray.removeAt(0); }

    workout.exercises.forEach((exercisePerf: ExercisePerformed) => {
      const exerciseId = (exercisePerf.exercise as Exercise)?._id || ((exercisePerf.exercise as unknown) as string);
      const exerciseGroup = this.createExerciseGroup(exerciseId);
      this.exercisesArray.push(exerciseGroup);
      
      const setsArray = exerciseGroup.get('sets') as FormArray;
      exercisePerf.sets.forEach((set: WorkoutSet) => {
        setsArray.push(this.createSetGroup(set.reps, set.weight, set.restTime, set.notes));
      });
    });
  }

  get f() { return this.workoutForm.controls; }
  get exercisesArray() { return this.f['exercises'] as FormArray; }

  getExerciseFormGroup(index: number): FormGroup {
    return this.exercisesArray.at(index) as FormGroup;
  }
  getSetsArray(exerciseIndex: number): FormArray {
    return this.getExerciseFormGroup(exerciseIndex).get('sets') as FormArray;
  }

  createExerciseGroup(exerciseId?: string): FormGroup {
    return this.formBuilder.group({
      exercise: [exerciseId || '', Validators.required],
      sets: this.formBuilder.array([]),
    });
  }
  
  onAddExerciseClicked(): void {
    const newExerciseGroup = this.createExerciseGroup();
    this.exercisesArray.push(newExerciseGroup);
    this.addSetToExercise(this.exercisesArray.length - 1); 
  }

  removeExercise(index: number): void {
    this.exercisesArray.removeAt(index);
  }

  createSetGroup(reps?: number, weight?: number, restTime?: number, notes?: string): FormGroup {
    return this.formBuilder.group({
        reps: [reps || 0, [Validators.required, Validators.min(0)]], 
        weight: [weight || 0, [Validators.required, Validators.min(0)]],
        restTime: [restTime ?? 60, [Validators.required, Validators.min(0)]],
        notes: [notes || '']
    });
  }

  addSetToExercise(exerciseIndex: number): void {
    this.getSetsArray(exerciseIndex).push(this.createSetGroup());
  }

  removeSet(exerciseIndex: number, setIndex: number): void {
    this.getSetsArray(exerciseIndex).removeAt(setIndex);
  }
  
  private calculateFormDuration(): number {
    let totalSeconds = 0;
    this.exercisesArray.value.forEach((exercisePerf: any) => {
        const exercise = this.allAvailableExercises.find(e => e._id === exercisePerf.exercise);
        if (exercise) {
            exercisePerf.sets.forEach((set: any) => {
                const work = exercise.isPowerlifting ? 90 : 60;
                totalSeconds += work + (set.restTime || 0);
            });
        }
    });
    return Math.round(totalSeconds / 60);
  }

  onSubmit(markAsCompleteOnClick = false): void {
    if (this.workoutForm.invalid) {
      this.workoutForm.markAllAsTouched();
      this.error = "Por favor, corrige los errores en el formulario.";
      return;
    }

    this.loading = true;
    this.isCompleting = markAsCompleteOnClick;
    this.submitSuccess = false;
    this.error = '';

    const formValues = this.workoutForm.value;
    const calculatedDuration = this.calculateFormDuration(); 

    const workoutData: Partial<Workout> = { 
      name: formValues.name,
      date: formValues.date,
      notes: formValues.notes,
      exercises: formValues.exercises.map((ex: any) => ({
        exercise: ex.exercise, 
        sets: ex.sets.map((s: any) => ({
          reps: Number(s.reps),
          weight: Number(s.weight),
          restTime: Number(s.restTime) || 0, 
          notes: s.notes,
        }))
      })),
      isCompleted: markAsCompleteOnClick,
      duration: calculatedDuration, 
      fromTemplate: this.editMode && this.workoutFromTemplateData 
                    ? (typeof this.workoutFromTemplateData === 'string' ? this.workoutFromTemplateData : this.workoutFromTemplateData._id) 
                    : (this.workoutId && this.editMode ? (this.workoutForm.get('fromTemplate')?.value || null) : null) // Mantener fromTemplate si se edita
    };
    
    
    const operation = (this.editMode && this.workoutId)
      ? this.workoutService.updateWorkout(this.workoutId, workoutData as Workout) // Hacer cast si es necesario
      : this.workoutService.createWorkout(workoutData as Workout);

    operation.subscribe({
      next: (savedWorkout) => {
        this.submitSuccess = true;
        this.loading = false;
        this.isCompleting = false;
        setTimeout(() => {
            this.router.navigate(['/workouts', savedWorkout._id]);
        }, 1500);
      },
      error: (err) => {
        this.error = err.error?.message || (this.editMode ? 'Error al actualizar el entrenamiento.' : 'Error al crear el entrenamiento.');
        this.loading = false;
        this.isCompleting = false;
      },
    });
  }

  cancel(): void {
    if (this.editMode && this.workoutId) {
      this.router.navigate(['/workouts', this.workoutId]);
    } else {
      this.router.navigate(['/workouts']);
    }
  }

  private formatDuration(minutes: number): string {
    if (!minutes) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 
        ? `${hours}:${mins.toString().padStart(2, '0')} hrs` 
        : `${mins} min`;
  }

}