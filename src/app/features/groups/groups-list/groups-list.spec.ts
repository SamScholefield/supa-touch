import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { GroupsList } from './groups-list';

describe('GroupsList', () => {
  let component: GroupsList;
  let fixture: ComponentFixture<GroupsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupsList],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
