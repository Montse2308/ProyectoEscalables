import { Component, type OnInit } from '@angular/core';
import { WorkoutService } from '../../../core/services/workout.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { Workout } from '../../../core/models/workout.model';
import { forkJoin } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  recentWorkouts: Workout[] = [];
  loading = true;
  error = '';

  // Metrics
  totalWorkouts = 0;
  weeklyWorkouts = 0;
  strongestLift = { exercise: '', weight: 0 };

  constructor(
    private router: RouterModule,
    private authService: AuthService,
    private userService: UserService,
    private workoutService: WorkoutService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Get current user
    this.user = this.authService.currentUserValue;

    // Load recent workouts and metrics
    forkJoin({
      recentWorkouts: this.workoutService.getRecentWorkouts(),
      metrics: this.workoutService.getUserMetrics(),
    }).subscribe({
      next: (data) => {
        this.recentWorkouts = data.recentWorkouts;

        // Set metrics
        this.totalWorkouts = data.metrics.totalWorkouts;
        this.weeklyWorkouts = data.metrics.weeklyWorkouts;
        this.strongestLift = data.metrics.strongestLift;

        this.loading = false;
      },
      error: (error) => {
        this.error = error.error.message || 'Failed to load dashboard data';
        this.loading = false;
      },
    });
  }
}
