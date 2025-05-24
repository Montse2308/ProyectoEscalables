// frontend/src/app/features/workouts/workouts.module.ts
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, type Routes } from "@angular/router";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { WorkoutFormComponent } from "./workout-form/workout-form.component";
// Si WorkoutListComponent y WorkoutDetailComponent también son standalone (lo son según app.routes.ts),
// y este módulo define rutas hacia ellos, también deberían importarse aquí.
// Sin embargo, tu app.routes.ts carga WorkoutListComponent y WorkoutDetailComponent de forma independiente.
// Workout.module.ts solo parece definir rutas para WorkoutFormComponent.

const routes: Routes = [
  // Rutas definidas en app.routes.ts para WorkoutListComponent y WorkoutDetailComponent
  // { path: "", component: WorkoutListComponent }, // Ejemplo si fuera parte de este módulo
  // { path: ":id", component: WorkoutDetailComponent }, // Ejemplo si fuera parte de este módulo
  { path: "new", component: WorkoutFormComponent },
  { path: "edit/:id", component: WorkoutFormComponent },
];

@NgModule({
  declarations: [
    // NINGÚN componente standalone aquí
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    // IMPORTA el componente standalone aquí
    WorkoutFormComponent
  ],
})
export class WorkoutsModule {}