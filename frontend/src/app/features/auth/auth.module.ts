// frontend/src/app/features/auth/auth.module.ts
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, type Routes } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";

import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";

const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "", redirectTo: "login", pathMatch: "full" },
];

@NgModule({
  declarations: [
    // NINGÚN componente standalone aquí
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    // IMPORTA los componentes standalone aquí
    LoginComponent,
    RegisterComponent
  ],
})
export class AuthModule {}