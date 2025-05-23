import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, type Routes } from "@angular/router"
import { ReactiveFormsModule, FormsModule } from "@angular/forms"

import { ExerciseManagementComponent } from "./exercise-management/exercise-management.component"
import { StandardManagementComponent } from "./standard-management/standard-management.component"

const routes: Routes = [
  { path: "exercises", component: ExerciseManagementComponent },
  { path: "standards", component: StandardManagementComponent },
  { path: "", redirectTo: "exercises", pathMatch: "full" },
]

@NgModule({
  declarations: [ExerciseManagementComponent, StandardManagementComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule.forChild(routes)],
})
export class AdminModule {}
