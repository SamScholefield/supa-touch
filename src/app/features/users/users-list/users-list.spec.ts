import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Users } from '../users';
import { UsersList } from './users-list';

const usersStub = {
  listUsers: async () => ({ data: [], error: null }),
  getUser: async () => ({ data: null, error: null }),
  updateUser: async () => ({ data: null, error: null }),
  setSystemAdmin: async () => ({ data: null, error: null }),
} as unknown as Users;

describe('UsersList', () => {
  let component: UsersList;
  let fixture: ComponentFixture<UsersList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersList],
      providers: [provideRouter([]), { provide: Users, useValue: usersStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
