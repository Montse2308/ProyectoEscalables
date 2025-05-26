import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { Dashboard } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  loading: boolean = true;
  error: string | null = null;
  user: { name: string } | null = null;
  totalWorkouts: number = 0;
  weeklyWorkouts: number = 0;
  strongestLift: { exercise: string; weight: number } = { exercise: '', weight: 0 };
  recentWorkouts: any[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (data: Dashboard) => {
        this.user = data.user ? { name: data.user.name } : null;
        this.totalWorkouts = data.totalWorkouts;
        this.weeklyWorkouts = data.weeklyWorkouts;
        this.strongestLift = data.strongestLift;
        this.recentWorkouts = data.recentWorkouts;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los datos del dashboard. Por favor intenta de nuevo.';
        this.loading = false;
      }
    });
  }
}