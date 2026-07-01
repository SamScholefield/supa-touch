import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Profile } from '../../../core/auth/profile.model';
import { Users } from '../users';
import { UsersForm } from './users-form';

const sampleUser: Profile = {
  id: 'u1',
  email: 'user@example.com',
  display_name: 'Sample User',
  avatar_url: null,
  is_system_admin: false,
  created_at: '',
  updated_at: '',
};

const usersStub = {
  listUsers: async () => ({ data: [], error: null }),
  getUser: async () => ({ data: sampleUser, error: null }),
  updateUser: async () => ({ data: null, error: null }),
} as unknown as Users;

describe('UsersForm', () => {
  let component: UsersForm;
  let fixture: ComponentFixture<UsersForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersForm],
      providers: [provideRouter([]), { provide: Users, useValue: usersStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersForm);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'u1');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
