// frontend/src/app/features/workouts/workout-detail/workout-detail.component.ts
import { Component, type OnInit, LOCALE_ID, Inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from '../../../core/services/workout.service';
import { Workout, ExercisePerformed, Set as WorkoutSet } from '../../../core/models/workout.model'; // Importar modelos correctos
import { Exercise } from '../../../core/models/exercise.model';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, DecimalPipe, TitleCasePipe],
  templateUrl: './workout-detail.component.html',
  styleUrls: ['./workout-detail.component.scss'],
  providers: [DatePipe, DecimalPipe, TitleCasePipe]
})
export class WorkoutDetailComponent implements OnInit {
  workout: Workout | null = null;
  loading = false;
  error = '';
  workoutId: string | null = null;
  calculatedDurationDisplay: string = 'N/A';

  constructor(
    private workoutService: WorkoutService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(LOCALE_ID) private locale: string
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.workoutId = params['id'];
        if (this.workoutId !== null) {
          this.loadWorkout(this.workoutId);
        }
      } else {
        this.router.navigate(['/workouts']);
      }
    });
  }

  loadWorkout(id: string): void {
    this.loading = true;
    this.error = ''; // Limpiar errores previos
    this.workoutService.getWorkout(id).subscribe({
      next: (workoutData) => {
        this.workout = workoutData;
        // console.log('Workout data received:', JSON.stringify(workoutData, null, 2)); // DEBUG
        if (this.workout) {
          this.calculatedDurationDisplay = this.formatDurationDisplay(this.calculateEstimatedDuration());
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar el entrenamiento.';
        console.error("Error al cargar workout:", err); // Log detallado del error
        this.loading = false;
        // No redirigir inmediatamente, permitir al usuario ver el error.
        // this.router.navigate(['/workouts']); 
      },
    });
  }

  editWorkout(): void {
    if (!this.workoutId) return;
    this.router.navigate(['/workouts/edit', this.workoutId]);
  }

  goBack(): void {
    this.router.navigate(['/workouts']);
  }

  getExerciseCount(): number {
    return this.workout && this.workout.exercises ? this.workout.exercises.length : 0;
  }

  getTotalSets(): number {
    if (!this.workout || !this.workout.exercises) return 0;
    return this.workout.exercises.reduce(
      (total, exercise) => total + (exercise.sets ? exercise.sets.length : 0),
      0
    );
  }

  getTotalVolume(): number {
    if (!this.workout || !this.workout.exercises) return 0;
    return this.workout.exercises.reduce((total, exercisePerf) => {
      return (
        total +
        (exercisePerf.sets ? exercisePerf.sets.reduce((setTotal, set) => {
          return setTotal + (set.weight || 0) * (set.reps || 0);
        }, 0) : 0)
      );
    }, 0);
  }

  getBestSet(exercisePerf: ExercisePerformed): string {
    if (!exercisePerf.sets || exercisePerf.sets.length === 0) return 'N/A';
    const bestSet = [...exercisePerf.sets].sort((a, b) => (b.weight * b.reps) - (a.weight * a.reps))[0];
    return `${bestSet.weight || 0}kg × ${bestSet.reps || 0}`;
  }

  getExerciseVolume(exercisePerf: ExercisePerformed): number {
    if (!exercisePerf.sets || exercisePerf.sets.length === 0) return 0;
    return exercisePerf.sets.reduce((total: number, set) => {
      return total + (set.weight || 0) * (set.reps || 0);
    }, 0);
  }

  calculateEstimatedDuration(): number {
    if (!this.workout || !this.workout.exercises || this.workout.exercises.length === 0) {
      return 0;
    }
    let totalSecondsForAllExercises = 0;
    this.workout.exercises.forEach((exercisePerf: ExercisePerformed) => {
      const exerciseDetails = exercisePerf.exercise as Exercise; 
      
      if (!exerciseDetails) { // Chequeo por si el ejercicio no se populó correctamente
          console.warn("Ejercicio no populado en workout:", exercisePerf);
          return; // Saltar este ejercicio si no hay detalles
      }

      const isPowerliftingExercise = exerciseDetails.isPowerlifting;
      const workTimePerSetInSeconds = isPowerliftingExercise ? 90 : 60;

      let exerciseSeconds = 0;
      if (exercisePerf.sets && exercisePerf.sets.length > 0) {
        const numSets = exercisePerf.sets.length;
        exerciseSeconds += numSets * workTimePerSetInSeconds;
        // NOTA: No estamos sumando restTime aquí porque no está en el modelo Set del Workout.
        // Si se quisiera, se necesitaría una lógica diferente o un restTime estándar.
      }
      totalSecondsForAllExercises += exerciseSeconds;
    });
    return totalSecondsForAllExercises / 60; 
  }

  formatDurationDisplay(totalMinutes: number): string {
    if (isNaN(totalMinutes) || totalMinutes < 0) return 'N/A';
    if (totalMinutes === 0 && (!this.workout || !this.getExerciseCount())) return '0 min';
    if (totalMinutes === 0 && this.workout && this.getExerciseCount() > 0) return '< 1 min';

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
    } else {
      return `${minutes} min`;
    }
  }

  get fromTemplateName(): string {
    if (this.workout && this.workout.fromTemplate) {
      // El backend popula 'fromTemplate' con el campo 'name'
      // por lo que esperamos un objeto como { _id: '...', name: '...' }
      // o podría ser solo el ID string si la populación falla o no se hace.
      if (
        typeof this.workout.fromTemplate === 'object' &&
        this.workout.fromTemplate !== null &&
        'name' in this.workout.fromTemplate
      ) {
        return (this.workout.fromTemplate as { name: string }).name;
      } else if (typeof this.workout.fromTemplate === 'string') {
        // Si es solo un ID, podrías mostrar el ID o un placeholder.
        // Por ahora, indicaremos que es un ID o que no se pudo cargar el nombre.
        // return `ID Plantilla: ${this.workout.fromTemplate}`; 
        return 'Nombre no disponible'; // O simplemente 'Desconocida'
      }
    }
    return 'Ninguna'; // Si no hay fromTemplate
  }
}