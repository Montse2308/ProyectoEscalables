import { Component, type OnInit } from '@angular/core';
import { FormBuilder, type FormGroup, Validators } from '@angular/forms';
import { CalculatorService } from '../../../core/services/calculator.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-one-rm-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './one-rm-calculator.component.html',
  styleUrls: ['./one-rm-calculator.component.scss'],
})
export class OneRmCalculatorComponent implements OnInit {
  calculatorForm!: FormGroup;
  result: number | null = null;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private calculatorService: CalculatorService
  ) {}

  ngOnInit(): void {
    this.calculatorForm = this.formBuilder.group({
      weight: ['', [Validators.required, Validators.min(1)]],
      reps: ['', [Validators.required, Validators.min(1), Validators.max(36)]],
    });
  }

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

    const weight = this.f['weight'].value;
    const reps = this.f['reps'].value;

    this.calculatorService.calculate1RM(weight, reps).subscribe({
      next: (data) => {
        this.result = data.oneRM;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error.message || 'Calculation failed';
        this.loading = false;
      },
    });
  }
}
