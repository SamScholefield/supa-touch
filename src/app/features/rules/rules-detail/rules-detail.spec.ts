import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { RulesDetail } from './rules-detail';

describe('RulesDetail', () => {
  let component: RulesDetail;
  let fixture: ComponentFixture<RulesDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RulesDetail],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RulesDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
