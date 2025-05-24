// frontend/src/app/features/admin/admin.module.ts - CORREGIDO
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, type Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Importa los componentes standalone si los vas a usar en las plantillas de otros componentes declarados en ESTE módulo.
// Para rutas, Angular los maneja directamente si son standalone.
// import { ExerciseManagementComponent } from './exercise-management/exercise-management.component';
// import { StandardManagementComponent } from './standard-management/standard-management.component';

const routes: Routes = [
  {
    path: 'exercises',
    loadComponent: () =>
      import(
        './exercise-management/exercise-management.component'
      ).then((m) => m.ExerciseManagementComponent), // Carga directa del componente standalone
  },
  {
    path: 'standards',
    loadComponent: () =>
      import(
        './standard-management/standard-management.component'
      ).then((m) => m.StandardManagementComponent), // Carga directa del componente standalone
  },
  { path: '', redirectTo: 'exercises', pathMatch: 'full' },
];

@NgModule({
  declarations: [], // Los componentes standalone NO se declaran aquí
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    // ExerciseManagementComponent, // Si los necesitaras en plantillas de componentes declarados aquí
    // StandardManagementComponent, // Si los necesitaras en plantillas de componentes declarados aquí
  ],
})
export class AdminModule {}