import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, type Routes } from "@angular/router"
import { ReactiveFormsModule, FormsModule } from "@angular/forms"

import { OneRmCalculatorComponent } from "./one-rm-calculator/one-rm-calculator.component"
import { WilksCalculatorComponent } from "./wilks-calculator/wilks-calculator.component"
import { StrengthLevelCalculatorComponent } from "./strength-level-calculator/strength-level-calculator.component"
import { ExerciseStrengthCalculatorComponent } from "./exercise-strength-calculator/exercise-strength-calculator.component"

const routes: Routes = [
  { path: "one-rm", component: OneRmCalculatorComponent },
  { path: "wilks", component: WilksCalculatorComponent },
  { path: "strength-level", component: StrengthLevelCalculatorComponent },
  { path: "exercise-strength", component: ExerciseStrengthCalculatorComponent },
  { path: "", redirectTo: "one-rm", pathMatch: "full" },
]

@NgModule({
  declarations: [
    OneRmCalculatorComponent,
    WilksCalculatorComponent,
    StrengthLevelCalculatorComponent,
    ExerciseStrengthCalculatorComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule.forChild(routes)],
})
export class CalculatorsModule {}
