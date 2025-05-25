// frontend/src/app/features/templates/template-detail/template-detail.component.ts
import { Component, type OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplateService } from '../../../core/services/template.service';
import { WorkoutService } from '../../../core/services/workout.service';
import { Template, TemplateExercise } from '../../../core/models/template.model'; // Asegúrate que TemplateExercise esté importado
import { Exercise } from '../../../core/models/exercise.model'; // Importar Exercise para el casting
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DecimalPipe } from '@angular/common'; // Para el pipe 'number'

@Component({
  selector: 'app-template-detail',
  standalone: true,
  imports: [CommonModule, RouterModule], // Añadir DecimalPipe si no está
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
    this.workoutService.startWorkoutFromTemplate(this.template._id).subscribe({
      next: (workout) => {
        this.startingWorkout = false;
        this.router.navigate(['/workouts', workout._id]);
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al iniciar el entrenamiento desde la plantilla';
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

  getEstimatedDuration(): number { // Este método ahora devuelve el total de minutos
    if (!this.template || !this.template.exercises || this.template.exercises.length === 0) {
      return 0;
    }

    let totalSecondsForAllExercises = 0;

    this.template.exercises.forEach((exerciseItem: TemplateExercise) => {
      const exerciseDetails = exerciseItem.exercise as Exercise; // Asumimos que está populado con 'isPowerlifting'
      const sets = exerciseItem.sets;
      const restTimePerSetInSeconds = exerciseItem.restTime || 0; // restTime está en segundos

      let workTimePerSetInSeconds: number;

      if (exerciseDetails && exerciseDetails.isPowerlifting) {
        workTimePerSetInSeconds = 90; // 90 segundos de trabajo por serie para powerlifting
      } else {
        workTimePerSetInSeconds = 60; // 60 segundos de trabajo por serie para otros
      }

      const timeForThisExerciseInSeconds = (sets * workTimePerSetInSeconds) + (sets * restTimePerSetInSeconds);
      totalSecondsForAllExercises += timeForThisExerciseInSeconds;
    });

    return totalSecondsForAllExercises / 60; // Convertir el total de segundos a minutos
  }

  // NUEVO MÉTODO para formatear la duración para la vista
  formatDurationDisplay(totalMinutes: number): string {
    if (isNaN(totalMinutes) || totalMinutes < 0) {
      return 'N/A';
    }
    if (totalMinutes === 0) {
        return '0 min';
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60); // Redondear minutos

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')} hrs`;
    } else {
      return `${minutes} min`;
    }
  }
}