import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CurrentPageService {

  constructor() { }

  private currentComponentNameSubject = new BehaviorSubject<string>(null)
  currentComponentName$ = this.currentComponentNameSubject.asObservable()

  setCurrentComponentName(name: string) {
    this.currentComponentNameSubject.next(name)
  }

  isCheckoutPage(componentName: string) {
    let isCheckoutPage = false
    if(componentName && this.containsPagesForCheckout(componentName)) {
      isCheckoutPage = true
    }
    return isCheckoutPage
  }

  private containsPagesForCheckout(name: string) {
    return name === 'CheckoutPageComponent' || name === 'CheckoutSummaryPageComponent'
  }

}
