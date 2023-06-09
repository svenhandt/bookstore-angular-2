import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CurrentPageService} from "../../services/infrastructure/current-page.service";
import {CartService} from "../../services/cart.service";
import {Observable, Subscription} from "rxjs";
import {CartModel} from "../../data/cart.model";
import {NgForm} from "@angular/forms";
import {PaymentService} from "../../services/payment.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css']
})
export class CheckoutPageComponent implements OnInit, OnDestroy {

  months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
  years = ['2023', '2024', '2025', '2026', '2027', '2028']

  @ViewChild('creditCardForm', {static: false}) creditCardForm: NgForm;

  currentCart$: Observable<CartModel>

  private paymentAmountUpdatedSubscription: Subscription

  constructor(private currentPageService: CurrentPageService,
              private cartService: CartService,
              private paymentService: PaymentService,
              private router: Router) { }

  ngOnInit(): void {
    this.currentPageService.setIsCheckoutPage(true)
    this.currentCart$ = this.cartService.currentCart$
    this.paymentAmountUpdatedSubscription = this.paymentService.paymentAmountUpdated$.subscribe((paymentUpdated: boolean) => {
      if(paymentUpdated) {
        this.router.navigate(['/checkout-summary'])
      }
    })
  }

  onSubmitCreditCardForm(currentCart: CartModel) {
    const totalPriceAsMoney = currentCart.totalPriceAsMoney
    if(totalPriceAsMoney) {
      this.paymentService.addOrChangeAmountInPaymentInfo(totalPriceAsMoney)
    }
  }

  onResetCreditCardForm() {
    this.creditCardForm.reset()
  }

  ngOnDestroy(): void {
    this.currentPageService.setIsCheckoutPage(false)
    this.paymentService.resetPaymentUpdated()
    if(this.paymentAmountUpdatedSubscription) {
      this.paymentAmountUpdatedSubscription.unsubscribe()
    }
  }

}
