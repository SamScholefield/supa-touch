import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ProfileEdit } from './profile-edit';

describe('ProfileEdit', () => {
  let component: ProfileEdit;
  let fixture: ComponentFixture<ProfileEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileEdit],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
