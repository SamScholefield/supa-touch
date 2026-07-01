import { Component } from '@angular/core';

import { PageTemplate } from '../../../shared/page-template/page-template';

@Component({
  selector: 'app-users-list',
  imports: [PageTemplate],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersList {}
