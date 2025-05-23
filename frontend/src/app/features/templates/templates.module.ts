import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, type Routes } from "@angular/router"
import { ReactiveFormsModule, FormsModule } from "@angular/forms"

import { TemplateListComponent } from "./template-list/template-list.component"
import { TemplateFormComponent } from "./template-form/template-form.component"
import { TemplateDetailComponent } from "./template-detail/template-detail.component"

const routes: Routes = [
  { path: "", component: TemplateListComponent },
  { path: "new", component: TemplateFormComponent },
  { path: "edit/:id", component: TemplateFormComponent },
  { path: "view/:id", component: TemplateDetailComponent },
]

@NgModule({
  declarations: [TemplateListComponent, TemplateFormComponent, TemplateDetailComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule.forChild(routes)],
})
export class TemplatesModule {}
