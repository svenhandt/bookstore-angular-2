import {Component, OnDestroy, OnInit} from '@angular/core';
import {CurrentPageService} from "../../services/infrastructure/current-page.service";
import {CartService} from "../../services/cart.service";
import {Observable} from "rxjs";
import {CartModel} from "../../data/cart.model";
import {PaymentService} from "../../services/payment.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-checkout-summary-page',
  templateUrl: './checkout-summary-page.component.html',
  styleUrls: ['./checkout-summary-page.component.css']
})
export class CheckoutSummaryPageComponent implements OnInit, OnDestroy {

  currentCart$: Observable<CartModel>

  constructor(private currentPageService: CurrentPageService,
              private cartService: CartService,
              private paymentService: PaymentService,
              private router: Router) { }

  ngOnInit(): void {
    this.currentPageService.setIsCheckoutPage(true)
    this.currentCart$ = this.cartService.currentCart$
    if(!this.paymentService.checkHasPaymentInfo()) {
      this.router.navigate(['/checkout'])
    }
  }

  onPlaceOrder() {
    this.paymentService.addChargeTransactionToPaymentInfo()
  }

  ngOnDestroy(): void {
    this.currentPageService.setIsCheckoutPage(false)
  }

}
