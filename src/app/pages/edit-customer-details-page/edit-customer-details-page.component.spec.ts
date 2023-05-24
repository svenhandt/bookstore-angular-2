import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCustomerDetailsPageComponent } from './edit-customer-details-page.component';

describe('EditCustomerDetailsPageComponent', () => {
  let component: EditCustomerDetailsPageComponent;
  let fixture: ComponentFixture<EditCustomerDetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditCustomerDetailsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCustomerDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
