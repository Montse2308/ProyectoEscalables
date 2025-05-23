import { Component, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from '../../../core/services/workout.service';
import { Workout } from '../../../core/models/workout.model';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './workout-detail.component.html',
  styleUrls: ['./workout-detail.component.scss'],
})
export class WorkoutDetailComponent implements OnInit {
  workout: Workout | null = null;
  loading = false;
  error = '';
  workoutId: string | null = null;

  constructor(
    private workoutService: WorkoutService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.workoutId = params['id'];
        this.loadWorkout(this.workoutId ?? '');
      } else {
        this.router.navigate(['/workouts']);
      }
    });
  }

  loadWorkout(id: string): void {
    this.loading = true;
    this.workoutService.getWorkout(id).subscribe({
      next: (workout) => {
        this.workout = workout;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error.message || 'Failed to load workout';
        this.loading = false;
        this.router.navigate(['/workouts']);
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
    return this.workout ? this.workout.exercises.length : 0;
  }

  getTotalSets(): number {
    if (!this.workout) return 0;
    return this.workout.exercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0
    );
  }

  getTotalVolume(): number {
    if (!this.workout) return 0;
    return this.workout.exercises.reduce((total, exercise) => {
      return (
        total +
        exercise.sets.reduce((setTotal, set) => {
          return setTotal + set.weight * set.reps;
        }, 0)
      );
    }, 0);
  }

  getBestSet(exercise: any): string {
    if (!exercise.sets || exercise.sets.length === 0) return 'N/A';

    const bestSet = exercise.sets.reduce((best: any, current: any) => {
      const bestWeight = best.weight * best.reps;
      const currentWeight = current.weight * current.reps;
      return currentWeight > bestWeight ? current : best;
    });

    return `${bestSet.weight}kg × ${bestSet.reps}`;
  }

  getExerciseVolume(exercise: any): number {
    if (!exercise.sets || exercise.sets.length === 0) return 0;

    return exercise.sets.reduce((total: number, set: any) => {
      return total + set.weight * set.reps;
    }, 0);
  }
}
