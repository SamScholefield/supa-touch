import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Teams } from '../teams';
import { TeamsList } from './teams-list';

const teamsStub = {
  createTeam: async () => ({ data: null, error: null }),
  updateTeam: async () => ({ data: null, error: null }),
  getTeam: async () => ({ data: null, error: null }),
  listMyTeams: async () => ({ data: [], error: null }),
} as unknown as Teams;

describe('TeamsList', () => {
  let component: TeamsList;
  let fixture: ComponentFixture<TeamsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamsList],
      providers: [provideRouter([]), { provide: Teams, useValue: teamsStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
