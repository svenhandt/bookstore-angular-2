import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutSummaryPageComponent } from './checkout-summary-page.component';

describe('CheckoutSummaryPageComponent', () => {
  let component: CheckoutSummaryPageComponent;
  let fixture: ComponentFixture<CheckoutSummaryPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckoutSummaryPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckoutSummaryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
