import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, type Routes } from "@angular/router"
import { ReactiveFormsModule, FormsModule } from "@angular/forms"

import { WorkoutFormComponent } from "./workout-form/workout-form.component"

const routes: Routes = [
  { path: "new", component: WorkoutFormComponent },
  { path: "edit/:id", component: WorkoutFormComponent },
]

@NgModule({
  declarations: [WorkoutFormComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule.forChild(routes)],
})
export class WorkoutsModule {}
