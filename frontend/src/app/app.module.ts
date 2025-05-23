import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Core components
import { HeaderComponent } from './core/components/header/header.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { SidenavComponent } from './core/components/sidenav/sidenav.component';

// Feature modules
import { AuthModule } from './features/auth/auth.module';
import { HomeModule } from './features/home/home.module';
import { CalculatorsModule } from './features/calculators/calculators.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { WorkoutsModule } from './features/workouts/workouts.module';
import { TemplatesModule } from './features/templates/templates.module';
import { ProfileModule } from './features/profile/profile.module';
import { AdminModule } from './features/admin/admin.module';

// Interceptors
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

// Services
import { AuthService } from './core/services/auth.service';
import { UserService } from './core/services/user.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SidenavComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,

    // Feature modules
    AuthModule,
    HomeModule,
    CalculatorsModule,
    DashboardModule,
    WorkoutsModule,
    TemplatesModule,
    ProfileModule,
    AdminModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    AuthService,
    UserService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
