import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderHistoryDetailsPageComponent } from './order-history-details-page.component';

describe('OrderHistoryDetailsPageComponent', () => {
  let component: OrderHistoryDetailsPageComponent;
  let fixture: ComponentFixture<OrderHistoryDetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderHistoryDetailsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderHistoryDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
