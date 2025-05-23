import { Component, type OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StandardService } from '../../../core/services/standard.service';
import { ExerciseService } from '../../../core/services/exercise.service';
import { AuthService } from '../../../core/services/auth.service';
import { Exercise } from '../../../core/models/exercise.model';
import { Standard } from '../../../core/models/standard.model';
import { User } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-standards-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './standards-view.component.html',
  styleUrls: ['./standards-view.component.scss'],
})
export class StandardsViewComponent implements OnInit {
  standardsForm!: FormGroup;
  exercises: Exercise[] = [];
  standards: Standard[] = [];
  loading = false;
  error = '';
  currentUser: User | null = null;
  selectedStandard: Standard | null = null;
  userLevel = '';
  userPercentage = 0;
  userWeight = 0;
  userOneRM = 0;

  constructor(
    private formBuilder: FormBuilder,
    private standardService: StandardService,
    private exerciseService: ExerciseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.standardsForm = this.formBuilder.group({
      exercise: ['', Validators.required],
      oneRM: ['', [Validators.required, Validators.min(1)]],
    });
  }

  loadData(): void {
    this.loading = true;

    // Get current user
    this.currentUser = this.authService.currentUserValue;
    this.userWeight = this.currentUser?.weight || 0;

    // Load exercises and standards
    Promise.all([
      this.exerciseService.getExercises().toPromise(),
      this.standardService.getStandards().toPromise(),
    ])
      .then(([exercisesData, standardsData]) => {
        this.exercises = (exercisesData || []).filter(
          (exercise) => exercise.isPowerlifting
        );
        this.standards = standardsData || [];
        this.loading = false;
      })
      .catch((error) => {
        this.error = error.error?.message || 'Failed to load data';
        this.loading = false;
      });
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.standardsForm.controls;
  }

  onSubmit(): void {
    if (this.standardsForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.selectedStandard = null;
    this.userLevel = '';
    this.userPercentage = 0;

    const exerciseId = this.f['exercise'].value;
    this.userOneRM = this.f['oneRM'].value;
    const gender = this.currentUser?.gender || 'male';

    // Find the standard for the selected exercise and gender
    const standard = this.standards.find(
      (s) => s.exercise._id === exerciseId && s.gender === gender
    );

    if (!standard) {
      this.error = 'No strength standards found for this exercise and gender';
      this.loading = false;
      return;
    }

    this.selectedStandard = standard;

    // Find the weight category for the user's weight
    const weightCategory = standard.weightCategories.find(
      (category) =>
        this.userWeight >= category.minWeight &&
        this.userWeight <= category.maxWeight
    );

    if (!weightCategory) {
      this.error = 'No strength standards found for your weight category';
      this.loading = false;
      return;
    }

    // Determine the user's strength level
    const { beginner, novice, intermediate, advanced, elite } =
      weightCategory.strengthLevels;

    if (this.userOneRM < beginner) {
      this.userLevel = 'beginner';
      this.userPercentage = (this.userOneRM / beginner) * 100;
    } else if (this.userOneRM < novice) {
      this.userLevel = 'beginner';
      this.userPercentage =
        100 + ((this.userOneRM - beginner) / (novice - beginner)) * 100;
    } else if (this.userOneRM < intermediate) {
      this.userLevel = 'novice';
      this.userPercentage =
        ((this.userOneRM - novice) / (intermediate - novice)) * 100;
    } else if (this.userOneRM < advanced) {
      this.userLevel = 'intermediate';
      this.userPercentage =
        ((this.userOneRM - intermediate) / (advanced - intermediate)) * 100;
    } else if (this.userOneRM < elite) {
      this.userLevel = 'advanced';
      this.userPercentage =
        ((this.userOneRM - advanced) / (elite - advanced)) * 100;
    } else {
      this.userLevel = 'elite';
      this.userPercentage = 100;
    }

    this.loading = false;
  }

  getExerciseName(exerciseId: string): string {
    const exercise = this.exercises.find((e) => e._id === exerciseId);
    return exercise ? exercise.name : 'Unknown Exercise';
  }

  getNextLevel(): string {
    switch (this.userLevel) {
      case 'beginner':
        return 'novice';
      case 'novice':
        return 'intermediate';
      case 'intermediate':
        return 'advanced';
      case 'advanced':
        return 'elite';
      case 'elite':
        return 'elite+';
      default:
        return '';
    }
  }
}
