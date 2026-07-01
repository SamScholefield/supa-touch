import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-teams-feature-outlet',
  template: `<router-outlet></router-outlet>`,
  imports: [RouterOutlet],
})
export class TeamsFeatureOutlet {}
