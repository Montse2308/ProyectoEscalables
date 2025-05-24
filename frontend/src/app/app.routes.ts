import type { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home/home.component').then(
        (m) => m.HomeComponent
      ),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'calculators', 
    loadComponent: () =>
      import(
        './features/calculators/calculators-hub/calculators-hub.component'
      ).then((m) => m.CalculatorsHubComponent),
  },
  {
    path: 'calculators/one-rm',
    loadComponent: () =>
      import(
        './features/calculators/one-rm-calculator/one-rm-calculator.component'
      ).then((m) => m.OneRmCalculatorComponent),
  },
  {
    path: 'calculators/wilks',
    loadComponent: () =>
      import(
        './features/calculators/wilks-calculator/wilks-calculator.component'
      ).then((m) => m.WilksCalculatorComponent),
  },
  {
    path: 'calculators/strength-level',
    loadComponent: () =>
      import(
        './features/calculators/strength-level-calculator/strength-level-calculator.component'
      ).then((m) => m.StrengthLevelCalculatorComponent),
  },
  {
    path: 'calculators/exercise-strength',
    loadComponent: () =>
      import(
        './features/calculators/exercise-strength-calculator/exercise-strength-calculator.component'
      ).then((m) => m.ExerciseStrengthCalculatorComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'workouts',
    loadComponent: () =>
      import('./features/workouts/workout-list/workout-list.component').then(
        (m) => m.WorkoutListComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'workouts/new',
    loadComponent: () =>
      import('./features/workouts/workout-form/workout-form.component').then(
        (m) => m.WorkoutFormComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'workouts/:id',
    loadComponent: () =>
      import(
        './features/workouts/workout-detail/workout-detail.component'
      ).then((m) => m.WorkoutDetailComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'workouts/edit/:id',
    loadComponent: () =>
      import('./features/workouts/workout-form/workout-form.component').then(
        (m) => m.WorkoutFormComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'templates',
    loadComponent: () =>
      import('./features/templates/template-list/template-list.component').then(
        (m) => m.TemplateListComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'templates/new',
    loadComponent: () =>
      import('./features/templates/template-form/template-form.component').then(
        (m) => m.TemplateFormComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'templates/view/:id',
    loadComponent: () =>
      import(
        './features/templates/template-detail/template-detail.component'
      ).then((m) => m.TemplateDetailComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'templates/edit/:id',
    loadComponent: () =>
      import('./features/templates/template-form/template-form.component').then(
        (m) => m.TemplateFormComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'standards',
    loadComponent: () =>
      import(
        './features/standards/standards-view/standards-view.component'
      ).then((m) => m.StandardsViewComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'admin/exercises',
    loadComponent: () =>
      import(
        './features/admin/exercise-management/exercise-management.component'
      ).then((m) => m.ExerciseManagementComponent),
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'admin/standards',
    loadComponent: () =>
      import(
        './features/admin/standard-management/standard-management.component'
      ).then((m) => m.StandardManagementComponent),
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
