import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CurrentPageService {

  private isCheckoutPageSubject = new BehaviorSubject<boolean>(false)
  isCheckoutPage$ = this.isCheckoutPageSubject.asObservable()

  constructor() { }

  setIsCheckoutPage(value: boolean) {
    this.isCheckoutPageSubject.next(value)
  }


}
