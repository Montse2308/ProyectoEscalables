import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, type Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { StandardsViewComponent } from './standards-view/standards-view.component';

const routes: Routes = [{ path: '', component: StandardsViewComponent }];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    StandardsViewComponent,
  ],
})
export class StandardsModule {}
