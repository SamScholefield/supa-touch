import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TeamsForm } from './teams-form';

describe('TeamsForm', () => {
  let component: TeamsForm;
  let fixture: ComponentFixture<TeamsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamsForm],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamsForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
