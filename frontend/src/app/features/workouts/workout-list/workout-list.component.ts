import { Component, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../../../core/services/workout.service';
import { Workout } from '../../../core/models/workout.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-workout-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './workout-list.component.html',
  styleUrls: ['./workout-list.component.scss'],
})
export class WorkoutListComponent implements OnInit {
  workouts: Workout[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  filteredWorkouts: Workout[] = [];
  confirmDelete = false;
  workoutToDelete: Workout | null = null;

  constructor(private workoutService: WorkoutService, private router: Router) {}

  ngOnInit(): void {
    this.loadWorkouts();
  }

  loadWorkouts(): void {
    this.loading = true;
    this.workoutService.getWorkouts().subscribe({
      next: (data) => {
        this.workouts = data;
        this.filterWorkouts();
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error.message || 'Failed to load workouts';
        this.loading = false;
      },
    });
  }

  onSearchChange(): void {
    this.filterWorkouts();
  }

  filterWorkouts(): void {
    if (!this.searchTerm.trim()) {
      this.filteredWorkouts = [...this.workouts];
    } else {
      const search = this.searchTerm.toLowerCase().trim();
      this.filteredWorkouts = this.workouts.filter(
        (workout) =>
          workout.name.toLowerCase().includes(search) ||
          (workout.notes && workout.notes.toLowerCase().includes(search))
      );
    }
  }

  createWorkout(): void {
    this.router.navigate(['/workouts/new']);
  }

  editWorkout(id: string): void {
    this.router.navigate(['/workouts/edit', id]);
  }

  viewWorkout(id: string): void {
    this.router.navigate(['/workouts', id]);
  }

  confirmDeleteWorkout(workout: Workout): void {
    this.workoutToDelete = workout;
    this.confirmDelete = true;
  }

  cancelDelete(): void {
    this.workoutToDelete = null;
    this.confirmDelete = false;
  }

  deleteWorkout(): void {
    if (!this.workoutToDelete) return;

    this.loading = true;
    this.workoutService.deleteWorkout(this.workoutToDelete._id).subscribe({
      next: () => {
        this.loading = false;
        this.confirmDelete = false;
        this.workoutToDelete = null;
        this.loadWorkouts();
      },
      error: (error) => {
        this.error = error.error.message || 'Failed to delete workout';
        this.loading = false;
      },
    });
  }

  getExerciseCount(workout: Workout): number {
    return workout.exercises.length;
  }

  getTotalSets(workout: Workout): number {
    return workout.exercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0
    );
  }
}
