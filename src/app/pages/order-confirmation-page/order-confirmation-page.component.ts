import {Component, OnDestroy, OnInit} from '@angular/core';
import {OrderService} from "../../services/order.service";
import {Observable, Subscription, tap} from "rxjs";
import {OrderModel} from "../../data/order.model";
import {CartService} from "../../services/cart.service";
import {CustomerService} from "../../services/customer.service";

@Component({
  selector: 'app-order-confirmation-page',
  templateUrl: './order-confirmation-page.component.html',
  styleUrls: ['./order-confirmation-page.component.css']
})
export class OrderConfirmationPageComponent implements OnInit, OnDestroy {

  createdOrder$: Observable<OrderModel>
  private cartSubscription: Subscription

  constructor(private orderService: OrderService,
              private cartService: CartService,
              private customerService: CustomerService) { }

  ngOnInit(): void {
    this.createdOrder$ = this.orderService.createdOrder$
    this.cartSubscription = this.cartService.currentCart$.subscribe(cart => {
      const currentCustomer = this.customerService.currentCustomerSubject.getValue()
      if(currentCustomer && !cart.deliveryAddress) {
        this.cartService.setBillingAndShippingAddress(currentCustomer.address)
      }
    })
  }

  ngOnDestroy(): void {
    if(this.cartSubscription) {
      this.cartSubscription.unsubscribe()
    }
  }

}
