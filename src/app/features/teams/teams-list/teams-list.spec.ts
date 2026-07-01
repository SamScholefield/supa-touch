import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TeamsList } from './teams-list';

describe('TeamsList', () => {
  let component: TeamsList;
  let fixture: ComponentFixture<TeamsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamsList],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
