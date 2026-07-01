import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Teams } from '../teams';
import { TeamsForm } from './teams-form';

const teamsStub = {
  createTeam: async () => ({ data: null, error: null }),
  updateTeam: async () => ({ data: null, error: null }),
  getTeam: async () => ({ data: null, error: null }),
  listMyTeams: async () => ({ data: [], error: null }),
} as unknown as Teams;

describe('TeamsForm', () => {
  let component: TeamsForm;
  let fixture: ComponentFixture<TeamsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamsForm],
      providers: [provideRouter([]), { provide: Teams, useValue: teamsStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamsForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
