import { Component, type OnInit } from '@angular/core';
import { FormBuilder, type FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CalculatorService } from '../../../core/services/calculator.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { forkJoin, of, type Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-wilks-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './wilks-calculator.component.html',
  styleUrls: ['./wilks-calculator.component.scss'],
})
export class WilksCalculatorComponent implements OnInit {
  calculatorForm!: FormGroup;
  result: number | null = null;
  loading = false;
  error = '';
  inputType: 'direct' | 'detailed' = 'direct'; // Para controlar qué campos se muestran

  // Para los resultados individuales de 1RM si se usa entrada detallada
  squatRM: number | null = null;
  benchRM: number | null = null;
  deadliftRM: number | null = null;
  totalRMFromDetailed: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private calculatorService: CalculatorService
  ) {}

  ngOnInit(): void {
    this.calculatorForm = this.formBuilder.group({
      bodyWeight: ['', [Validators.required, Validators.min(30), Validators.max(300)]],
      gender: ['male', Validators.required],
      inputType: ['direct', Validators.required], // Selector para el tipo de entrada

      // Campos para entrada directa del total levantado
      liftedWeightTotal: ['', [Validators.required, Validators.min(1)]],

      // Campos para entrada detallada por ejercicio
      squatWeight: ['', [Validators.min(1)]],
      squatReps: ['', [Validators.min(1), Validators.max(36)]],
      benchWeight: ['', [Validators.min(1)]],
      benchReps: ['', [Validators.min(1), Validators.max(36)]],
      deadliftWeight: ['', [Validators.min(1)]],
      deadliftReps: ['', [Validators.min(1), Validators.max(36)]],
    });

    this.onInputTypeChange(); // Configurar validadores iniciales
  }

  get f(): { [key: string]: AbstractControl } {
    return this.calculatorForm.controls;
  }

  onInputTypeChange(): void {
    this.inputType = this.f['inputType'].value;
    this.result = null; // Limpiar resultado anterior al cambiar tipo de entrada
    this.squatRM = null;
    this.benchRM = null;
    this.deadliftRM = null;
    this.totalRMFromDetailed = null;

    if (this.inputType === 'direct') {
      this.f['liftedWeightTotal'].setValidators([Validators.required, Validators.min(1)]);
      this.f['squatWeight'].clearValidators();
      this.f['squatReps'].clearValidators();
      this.f['benchWeight'].clearValidators();
      this.f['benchReps'].clearValidators();
      this.f['deadliftWeight'].clearValidators();
      this.f['deadliftReps'].clearValidators();
    } else { // 'detailed'
      this.f['liftedWeightTotal'].clearValidators();
      this.f['squatWeight'].setValidators([Validators.required, Validators.min(1)]);
      this.f['squatReps'].setValidators([Validators.required, Validators.min(1), Validators.max(36)]);
      this.f['benchWeight'].setValidators([Validators.required, Validators.min(1)]);
      this.f['benchReps'].setValidators([Validators.required, Validators.min(1), Validators.max(36)]);
      this.f['deadliftWeight'].setValidators([Validators.required, Validators.min(1)]);
      this.f['deadliftReps'].setValidators([Validators.required, Validators.min(1), Validators.max(36)]);
    }
    this.f['liftedWeightTotal'].updateValueAndValidity();
    this.f['squatWeight'].updateValueAndValidity();
    this.f['squatReps'].updateValueAndValidity();
    this.f['benchWeight'].updateValueAndValidity();
    this.f['benchReps'].updateValueAndValidity();
    this.f['deadliftWeight'].updateValueAndValidity();
    this.f['deadliftReps'].updateValueAndValidity();
  }

  private calculate1RMForExercise(weight: number, reps: number): Observable<number> {
    if (!weight || !reps) return of(0);
    if (reps === 1) return of(weight);
    return this.calculatorService.calculate1RM(weight, reps).pipe(
      map(response => response.oneRM),
      catchError(err => {
        this.error += `Error calculando 1RM para ${weight}kg x ${reps}reps. `;
        return of(0); // Retorna 0 si hay error para no romper el forkJoin
      })
    );
  }

  onSubmit(): void {
    if (this.calculatorForm.invalid) {
      // Marcar todos los campos como 'touched' para mostrar errores
      Object.values(this.calculatorForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.result = null;
    this.error = '';
    this.squatRM = null;
    this.benchRM = null;
    this.deadliftRM = null;
    this.totalRMFromDetailed = null;

    const bodyWeight = this.f['bodyWeight'].value;
    const gender = this.f['gender'].value;

    if (this.inputType === 'direct') {
      const liftedWeightTotal = this.f['liftedWeightTotal'].value;
      this.calculateWilksScore(bodyWeight, liftedWeightTotal, gender);
    } else { // 'detailed'
      const squatWeight = this.f['squatWeight'].value;
      const squatReps = this.f['squatReps'].value;
      const benchWeight = this.f['benchWeight'].value;
      const benchReps = this.f['benchReps'].value;
      const deadliftWeight = this.f['deadliftWeight'].value;
      const deadliftReps = this.f['deadliftReps'].value;

      const squatRMO$ = this.calculate1RMForExercise(squatWeight, squatReps);
      const benchRMO$ = this.calculate1RMForExercise(benchWeight, benchReps);
      const deadliftRMO$ = this.calculate1RMForExercise(deadliftWeight, deadliftReps);

      forkJoin([squatRMO$, benchRMO$, deadliftRMO$]).subscribe(
        ([squatRM, benchRM, deadliftRM]) => {
          if (this.error) { // Si hubo errores en los cálculos de 1RM
             this.loading = false;
             return;
          }
          this.squatRM = squatRM;
          this.benchRM = benchRM;
          this.deadliftRM = deadliftRM;
          const totalLifted = squatRM + benchRM + deadliftRM;
          this.totalRMFromDetailed = totalLifted;

          if (totalLifted > 0) {
            this.calculateWilksScore(bodyWeight, totalLifted, gender);
          } else {
            this.error = 'No se pudo calcular el total levantado a partir de los datos detallados.';
            this.loading = false;
          }
        },
        (err) => {
          this.error = 'Ocurrió un error al procesar los levantamientos detallados.';
          this.loading = false;
        }
      );
    }
  }

  private calculateWilksScore(bodyWeight: number, totalLifted: number, gender: string): void {
    this.calculatorService.calculateWilks(bodyWeight, totalLifted, gender).subscribe({
      next: (data) => {
        this.result = data.wilksScore;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error en el cálculo de Wilks.';
        this.loading = false;
      },
    });
  }
}