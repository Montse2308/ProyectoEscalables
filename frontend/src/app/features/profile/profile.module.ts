import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, type Routes } from "@angular/router"
import { ReactiveFormsModule, FormsModule } from "@angular/forms"

import { ProfileComponent } from "./profile/profile.component"

const routes: Routes = [{ path: "", component: ProfileComponent }]

@NgModule({
  declarations: [ProfileComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule.forChild(routes)],
})
export class ProfileModule {}
