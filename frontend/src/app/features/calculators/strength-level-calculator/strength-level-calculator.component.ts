import { Component, type OnInit } from '@angular/core';
import { FormBuilder, type FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CalculatorService } from '../../../core/services/calculator.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { forkJoin, of, type Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-strength-level-calculator', 
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './strength-level-calculator.component.html', 
  styleUrls: ['./strength-level-calculator.component.scss'],
})
export class StrengthLevelCalculatorComponent implements OnInit {
  calculatorForm!: FormGroup;
  ipfPointsResult: number | null = null; 
  loading = false;
  error = '';

  inputType: 'direct' | 'detailed' = 'direct';

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
      bodyWeight: ['', [Validators.required, Validators.min(20), Validators.max(300)]],
      gender: ['male', Validators.required],
      equipment: ['classic_raw', Validators.required], 
      inputType: ['direct', Validators.required],

      liftedWeightTotal: ['', [Validators.required, Validators.min(1)]],

      squatWeight: ['', [Validators.min(1)]],
      squatReps: ['', [Validators.min(1), Validators.max(36)]],
      benchWeight: ['', [Validators.min(1)]],
      benchReps: ['', [Validators.min(1), Validators.max(36)]],
      deadliftWeight: ['', [Validators.min(1)]],
      deadliftReps: ['', [Validators.min(1), Validators.max(36)]],
    });

    this.onInputTypeChange(); 
  }

  get f(): { [key: string]: AbstractControl } {
    return this.calculatorForm.controls;
  }

  onInputTypeChange(): void {
    this.inputType = this.f['inputType'].value;
    this.ipfPointsResult = null;
    this.squatRM = null;
    this.benchRM = null;
    this.deadliftRM = null;
    this.totalRMFromDetailed = null;
    this.error = '';

    if (this.inputType === 'direct') {
      this.f['liftedWeightTotal'].setValidators([Validators.required, Validators.min(1)]);
      this.f['squatWeight'].clearValidators();
      this.f['squatReps'].clearValidators();
      this.f['benchWeight'].clearValidators();
      this.f['benchReps'].clearValidators();
      this.f['deadliftWeight'].clearValidators();
      this.f['deadliftReps'].clearValidators();
    } else { 
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
    if (Number(reps) === 1) return of(Number(weight));
    return this.calculatorService.calculate1RM(Number(weight), Number(reps)).pipe(
      map(response => response.oneRM),
      catchError(err => {
        this.error += `Error calculando 1RM para ${weight}kg x ${reps}reps. `;
        return of(0);
      })
    );
  }

  onSubmit(): void {
    if (this.calculatorForm.invalid) {
      Object.values(this.calculatorForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.ipfPointsResult = null;
    this.error = '';
    this.squatRM = null;
    this.benchRM = null;
    this.deadliftRM = null;
    this.totalRMFromDetailed = null;

    const bodyWeight = this.f['bodyWeight'].value;
    const gender = this.f['gender'].value;
    const equipment = this.f['equipment'].value;

    if (this.inputType === 'direct') {
      const liftedWeightTotal = this.f['liftedWeightTotal'].value;
      this.callIpfPointsService(bodyWeight, liftedWeightTotal, gender, equipment);
    } else { 
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
          if (this.error && this.error.length > 0) {
             this.loading = false;
             return;
          }
          this.squatRM = squatRM;
          this.benchRM = benchRM;
          this.deadliftRM = deadliftRM;
          const totalLifted = squatRM + benchRM + deadliftRM;
          this.totalRMFromDetailed = totalLifted;

          if (totalLifted > 0) {
            this.callIpfPointsService(bodyWeight, totalLifted, gender, equipment);
          } else {
            this.error = 'No se pudo calcular el total levantado. Verifica los datos de los ejercicios.';
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

  private callIpfPointsService(bodyWeight: number, totalLifted: number, gender: string, equipment: string): void {
    
    if (equipment !== 'classic_raw') {
        this.error = "Por el momento, solo se soportan cálculos para Powerlifting Clásico (Raw).";
        this.loading = false;
        return;
    }

    let A, B, C;
    if (gender === 'male') {
        A = 123.59533; B = 149.26993; C = 0.0073838;
    } else { 
        A = 107.89909; B = 122.91604; C = 0.0093104;
    }

    if (bodyWeight <= 0 || totalLifted <= 0) {
        this.error = "El peso corporal y el total levantado deben ser mayores a cero.";
        this.loading = false;
        return;
    }

    const denominator = A - B * Math.exp(-C * bodyWeight);
    if (denominator <= 0) {
        this.error = "No se pueden calcular los puntos IPF con los datos proporcionados (denominador inválido).";
        this.loading = false;
        return;
    }
    this.ipfPointsResult = 100 * (totalLifted / denominator);
    this.loading = false;
    
  }
}