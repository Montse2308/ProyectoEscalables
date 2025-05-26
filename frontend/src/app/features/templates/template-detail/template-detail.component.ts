import { Component, type OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplateService } from '../../../core/services/template.service';
import { WorkoutService } from '../../../core/services/workout.service';
import { Template, TemplateExercise } from '../../../core/models/template.model'; 
import { Exercise } from '../../../core/models/exercise.model'; 
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Workout } from '../../../core/models/workout.model'; 


@Component({
  selector: 'app-template-detail',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './template-detail.component.html',
  styleUrls: ['./template-detail.component.scss'],
})
export class TemplateDetailComponent implements OnInit {
  template: Template | null = null;
  loading = false;
  startingWorkout = false;
  error = '';
  templateId: string | null = null;

  constructor(
    private templateService: TemplateService,
    private workoutService: WorkoutService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.templateId = params['id'];
        this.loadTemplate(this.templateId ?? '');
      } else {
        this.router.navigate(['/templates']);
      }
    });
  }

  loadTemplate(id: string): void {
    this.loading = true;
    this.templateService.getTemplate(id).subscribe({
      next: (template) => {
        this.template = template;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al cargar la plantilla';
        this.loading = false;
        this.router.navigate(['/templates']);
      },
    });
  }

  startWorkout(): void {
    if (!this.template) return;

    this.startingWorkout = true;
    this.error = ''; 
    this.workoutService.startWorkoutFromTemplate(this.template._id).subscribe({
      next: (newlyCreatedWorkout: Workout) => {
        this.startingWorkout = false;
        this.router.navigate(['/workouts/edit', newlyCreatedWorkout._id], {
          state: { 
            templateData: this.template, 
            workoutShell: newlyCreatedWorkout 
          }
        });
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al iniciar el entrenamiento desde la plantilla.';
        this.startingWorkout = false;
      },
    });
  }

  editTemplate(): void {
    if (!this.templateId) return;
    this.router.navigate(['/templates/edit', this.templateId]);
  }

  goBack(): void {
    this.router.navigate(['/templates']);
  }

  getExerciseCount(): number {
    return this.template ? this.template.exercises.length : 0;
  }

  getTotalSets(): number {
    if (!this.template) return 0;
    return this.template.exercises.reduce(
      (total, exerciseItem) => total + exerciseItem.sets,
      0
    );
  }

  getEstimatedDuration(): number { 
    if (!this.template || !this.template.exercises || this.template.exercises.length === 0) {
      return 0;
    }

    let totalSecondsForAllExercises = 0;

    this.template.exercises.forEach((exerciseItem: TemplateExercise) => {
      const exerciseDetails = exerciseItem.exercise as Exercise;
      const sets = exerciseItem.sets;
      const restTimePerSetInSeconds = exerciseItem.restTime || 0;

      let workTimePerSetInSeconds: number;

      if (exerciseDetails && exerciseDetails.isPowerlifting) {
        workTimePerSetInSeconds = 90; 
      } else {
        workTimePerSetInSeconds = 60; 
      }

      const timeForThisExerciseInSeconds = (sets * workTimePerSetInSeconds) + (sets * restTimePerSetInSeconds);
      totalSecondsForAllExercises += timeForThisExerciseInSeconds;
    });

    return totalSecondsForAllExercises / 60;
  }

  formatDurationDisplay(totalMinutes: number): string {
    if (isNaN(totalMinutes) || totalMinutes < 0) {
      return 'N/A';
    }
    if (totalMinutes === 0) {
        return '0 min';
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60); 

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')} hrs`;
    } else {
      return `${minutes} min`;
    }
  }
}