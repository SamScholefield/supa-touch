import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Teams } from '../teams';
import { TeamsForm } from './teams-form';

const teamsStub = {
  listMyTeams: async () => ({ data: [], error: null }),
  getTeam: async () => ({ data: null, error: null }),
  listMembers: async () => ({ data: [], error: null }),
  createTeam: async () => ({ data: null, error: null }),
  renameTeam: async () => ({ data: null, error: null }),
  deleteTeam: async () => ({ data: null, error: null }),
  addMember: async () => ({ data: null, error: null }),
  removeMember: async () => ({ data: null, error: null }),
  setMemberAdmin: async () => ({ data: null, error: null }),
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
