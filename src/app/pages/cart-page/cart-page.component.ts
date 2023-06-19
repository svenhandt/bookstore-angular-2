import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs";
import {CartModel} from "../../data/cart.model";
import {CartService} from "../../services/cart.service";
import {LineItemModel} from "../../data/lineItemModel";
import {CustomerService} from "../../services/customer.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.css']
})
export class CartPageComponent implements OnInit {

  currentCart$: Observable<CartModel>

  constructor(private cartService: CartService,
              private customerService: CustomerService,
              private router: Router) {

  }

  ngOnInit(): void {
    this.currentCart$ = this.cartService.currentCart$
  }

  onRemoveEntry(cartEntry: LineItemModel) {
    this.cartService.removeFromCart(cartEntry)
  }

  onNavigateToCheckout() {
    const currentCustomer = this.customerService.currentCustomerSubject.getValue()
    if(!currentCustomer) {
      this.customerService.checkoutLoginSubject.next(true)
    }
    this.router.navigate(['/checkout'])
  }

}
