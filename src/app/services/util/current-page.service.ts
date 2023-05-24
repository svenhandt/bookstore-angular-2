import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrentPageService {

  constructor() { }

  private currentComponentName: string | undefined

  setCurrentComponentName(name: string | undefined) {
    this.currentComponentName = name
  }

  isCheckoutPage() {
    let isCheckoutPage = false
    if(this.currentComponentName && this.containsPagesForCheckout(this.currentComponentName)) {
      isCheckoutPage = true
    }
    return isCheckoutPage
  }

  private containsPagesForCheckout(name: string) {
    return name === 'CheckoutPageComponent' || name === 'CheckoutSummaryPageComponent'
  }

}
