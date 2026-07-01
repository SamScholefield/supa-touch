import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ProfileDetail } from './profile-detail';

describe('ProfileDetail', () => {
  let component: ProfileDetail;
  let fixture: ComponentFixture<ProfileDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileDetail],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
