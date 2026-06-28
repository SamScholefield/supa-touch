import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Footer } from '../footer/footer';
import { Header } from '../header/header';

@Component({
  selector: 'app-app-layout',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayout {}
