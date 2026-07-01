import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Tables } from './tables';

describe('Tables', () => {
  let component: Tables;
  let fixture: ComponentFixture<Tables>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tables],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Tables);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
