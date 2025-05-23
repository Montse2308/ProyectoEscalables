import { Component, type OnInit } from '@angular/core';
import { FormBuilder, type FormGroup, Validators } from '@angular/forms';
import { CalculatorService } from '../../../core/services/calculator.service';
import { ExerciseService } from '../../../core/services/exercise.service';
import { Exercise } from '../../../core/models/exercise.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-exercise-strength-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './exercise-strength-calculator.component.html',
  styleUrls: ['./exercise-strength-calculator.component.scss'],
})
export class ExerciseStrengthCalculatorComponent implements OnInit {
  calculatorForm!: FormGroup;
  exercises: Exercise[] = [];
  loading = false;
  loadingExercises = false;
  error = '';
  result: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private calculatorService: CalculatorService,
    private exerciseService: ExerciseService
  ) {}

  ngOnInit(): void {
    this.calculatorForm = this.formBuilder.group({
      exercise: ['', Validators.required],
      weight: ['', [Validators.required, Validators.min(1)]],
      reps: ['', [Validators.required, Validators.min(1), Validators.max(36)]],
      bodyWeight: [
        '',
        [Validators.required, Validators.min(30), Validators.max(300)],
      ],
      gender: ['male', Validators.required],
    });

    this.loadExercises();
  }

  loadExercises(): void {
    this.loadingExercises = true;
    this.exerciseService.getExercises().subscribe({
      next: (data) => {
        this.exercises = data;
        this.loadingExercises = false;
      },
      error: (error) => {
        this.error = error.error.message || 'Failed to load exercises';
        this.loadingExercises = false;
      },
    });
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.calculatorForm.controls;
  }

  onSubmit(): void {
    if (this.calculatorForm.invalid) {
      return;
    }

    this.loading = true;
    this.result = null;
    this.error = '';

    const exercise = this.f['exercise'].value;
    const weight = this.f['weight'].value;
    const reps = this.f['reps'].value;
    const bodyWeight = this.f['bodyWeight'].value;
    const gender = this.f['gender'].value;

    // First calculate 1RM
    this.calculatorService.calculate1RM(weight, reps).subscribe({
      next: (oneRMData) => {
        // Then calculate strength level with the 1RM
        this.calculatorService
          .calculateStrengthLevel(exercise, oneRMData.oneRM, bodyWeight, gender)
          .subscribe({
            next: (strengthData) => {
              this.result = {
                ...strengthData,
                oneRM: oneRMData.oneRM,
              };
              this.loading = false;
            },
            error: (error) => {
              this.error =
                error.error.message || 'Strength level calculation failed';
              this.loading = false;
            },
          });
      },
      error: (error) => {
        this.error = error.error.message || '1RM calculation failed';
        this.loading = false;
      },
    });
  }
}
