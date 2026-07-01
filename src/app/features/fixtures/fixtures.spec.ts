import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Fixtures } from './fixtures';

describe('Fixtures', () => {
  let component: Fixtures;
  let fixture: ComponentFixture<Fixtures>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fixtures],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Fixtures);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
