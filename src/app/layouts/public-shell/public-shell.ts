import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-shell',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './public-shell.html',
  styleUrl: './public-shell.scss',
})
export class PublicShell {}
