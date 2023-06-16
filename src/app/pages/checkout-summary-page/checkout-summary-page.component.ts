import {Component, OnDestroy, OnInit} from '@angular/core';
import {CurrentPageService} from "../../services/infrastructure/current-page.service";
import {CartService} from "../../services/cart.service";
import {combineLatest, concatMap, Observable, startWith, switchMap} from "rxjs";
import {CartModel} from "../../data/cart.model";
import {PaymentService} from "../../services/payment.service";
import {Router} from "@angular/router";
import {OrderService} from "../../services/order.service";

@Component({
  selector: 'app-checkout-summary-page',
  templateUrl: './checkout-summary-page.component.html',
  styleUrls: ['./checkout-summary-page.component.css']
})
export class CheckoutSummaryPageComponent implements OnInit, OnDestroy {

  currentCart$: Observable<CartModel>
  paymentAuthorized$: Observable<boolean>

  constructor(private currentPageService: CurrentPageService,
              private cartService: CartService,
              private paymentService: PaymentService,
              private orderService: OrderService,
              private router: Router) { }

  ngOnInit(): void {
    this.currentPageService.setIsCheckoutPage(true)
    this.currentCart$ = this.cartService.currentCart$.pipe(
      startWith(null)
    )
    this.paymentAuthorized$ = this.paymentService.paymentAuthorized$.pipe(
      startWith(false)
    )
    if(!this.paymentService.checkHasPaymentInfo()) {
      this.router.navigate(['/checkout'])
    }
    combineLatest([this.currentCart$, this.paymentAuthorized$]).pipe(
      switchMap(([currentCart, paymentAuthorizedSuccess]) => {
        if(currentCart && paymentAuthorizedSuccess) {

        }
        return new Observable()
      })
    )
  }

  onPlaceOrder() {
    this.paymentService.addAuthorizeTransactionToPaymentInfo()
  }

  ngOnDestroy(): void {
    this.currentPageService.setIsCheckoutPage(false)
  }

}
