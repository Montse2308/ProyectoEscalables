import { Component, type OnInit } from '@angular/core';
import { FormBuilder, type FormGroup, Validators } from '@angular/forms';
import { CalculatorService } from '../../../core/services/calculator.service';

@Component({
  selector: 'app-wilks-calculator',
  templateUrl: './wilks-calculator.component.html',
  styleUrls: ['./wilks-calculator.component.scss'],
})
export class WilksCalculatorComponent implements OnInit {
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
      bodyWeight: [
        '',
        [Validators.required, Validators.min(30), Validators.max(300)],
      ],
      liftedWeight: ['', [Validators.required, Validators.min(1)]],
      gender: ['male', Validators.required],
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

    const bodyWeight = this.f['bodyWeight'].value;
    const liftedWeight = this.f['liftedWeight'].value;
    const gender = this.f['gender'].value;

    this.calculatorService
      .calculateWilks(bodyWeight, liftedWeight, gender)
      .subscribe({
        next: (data) => {
          this.result = data.wilksScore;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.error.message || 'Calculation failed';
          this.loading = false;
        },
      });
  }
}
