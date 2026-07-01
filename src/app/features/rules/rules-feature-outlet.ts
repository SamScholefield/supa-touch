import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-rules-feature-outlet',
  template: `<router-outlet></router-outlet>`,
  imports: [RouterOutlet],
})
export class RulesFeatureOutlet {}
