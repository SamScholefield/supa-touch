import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Theme } from './core/theme/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // Instantiate the theme service at bootstrap so the persisted theme applies immediately.
  private readonly theme = inject(Theme);
}
