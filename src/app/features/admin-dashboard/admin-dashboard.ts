import { Component } from '@angular/core';

import { PageTemplate } from '../../shared/page-template/page-template';

@Component({
  selector: 'app-admin-dashboard',
  imports: [PageTemplate],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard {}
