import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlayerComponent } from "./pages/player/player.component";

const routes: Routes = [
  { path: "", component: PlayerComponent },
  { path: "**", redirectTo: "" } // wildcard para uma pagina vazia
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
