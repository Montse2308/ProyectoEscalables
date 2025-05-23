import { Component, type OnInit } from '@angular/core';
import { FormBuilder, type FormGroup, Validators } from '@angular/forms';
import { CalculatorService } from '../../../core/services/calculator.service';
import { ExerciseService } from '../../../core/services/exercise.service';
import { Exercise } from '../../../core/models/exercise.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-strength-level-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './strength-level-calculator.component.html',
  styleUrls: ['./strength-level-calculator.component.scss'],
})
export class StrengthLevelCalculatorComponent implements OnInit {
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
      oneRM: ['', [Validators.required, Validators.min(1)]],
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
        this.exercises = data.filter((exercise) => exercise.isPowerlifting);
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
    const oneRM = this.f['oneRM'].value;
    const bodyWeight = this.f['bodyWeight'].value;
    const gender = this.f['gender'].value;

    this.calculatorService
      .calculateStrengthLevel(exercise, oneRM, bodyWeight, gender)
      .subscribe({
        next: (data) => {
          this.result = data;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.error.message || 'Calculation failed';
          this.loading = false;
        },
      });
  }
}
