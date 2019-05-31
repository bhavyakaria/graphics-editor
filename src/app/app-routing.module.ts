import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaintComponent } from './paint/paint.component';

const routes: Routes = [
  {
    path: 'paint',
    component: PaintComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
