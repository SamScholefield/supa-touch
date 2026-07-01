import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { GroupsForm } from './groups-form';

describe('GroupsForm', () => {
  let component: GroupsForm;
  let fixture: ComponentFixture<GroupsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupsForm],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupsForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
