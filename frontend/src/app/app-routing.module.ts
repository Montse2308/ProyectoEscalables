import { NgModule } from "@angular/core"
import { RouterModule, type Routes } from "@angular/router"

// Guards
import { AuthGuard } from "./core/guards/auth.guard"
import { AdminGuard } from "./core/guards/admin.guard"

const routes: Routes = [
  {
    path: "",
    loadChildren: () => import("./features/home/home.module").then((m) => m.HomeModule),
  },
  {
    path: "auth",
    loadChildren: () => import("./features/auth/auth.module").then((m) => m.AuthModule),
  },
  {
    path: "calculators",
    loadChildren: () => import("./features/calculators/calculators.module").then((m) => m.CalculatorsModule),
  },
  {
    path: "dashboard",
    loadChildren: () => import("./features/dashboard/dashboard.module").then((m) => m.DashboardModule),
    canActivate: [AuthGuard],
  },
  {
    path: "workouts",
    loadChildren: () => import("./features/workouts/workouts.module").then((m) => m.WorkoutsModule),
    canActivate: [AuthGuard],
  },
  {
    path: "templates",
    loadChildren: () => import("./features/templates/templates.module").then((m) => m.TemplatesModule),
    canActivate: [AuthGuard],
  },
  {
    path: "profile",
    loadChildren: () => import("./features/profile/profile.module").then((m) => m.ProfileModule),
    canActivate: [AuthGuard],
  },
  {
    path: "admin",
    loadChildren: () => import("./features/admin/admin.module").then((m) => m.AdminModule),
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: "**",
    redirectTo: "",
  },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
