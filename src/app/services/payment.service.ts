import { Injectable } from '@angular/core';
import {AbstractCommercetoolsService} from "./abstract/abstract.commercetools.service";
import {CommercetoolsApiService} from "./infrastructure/commercetools.api.service";
import {
  ClientResponse,
  Money,
  MyPayment,
  MyPaymentDraft,
  PaymentMethodInfo
} from "@commercetools/platform-sdk";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PaymentService extends AbstractCommercetoolsService {

  private paymentUpdatedSubject = new BehaviorSubject<boolean>(false)
  paymentUpdated$ = this.paymentUpdatedSubject.asObservable()

  constructor(commercetoolsApiService: CommercetoolsApiService) {
    super(commercetoolsApiService)
  }

  addOrUpdatePaymentInfo(paymentAmount: Money) {
    const myPaymentAsStr = localStorage.getItem('session_payment_info')
    if(myPaymentAsStr) {
      const myPayment = JSON.parse(myPaymentAsStr) as MyPayment
      this.updatePaymentInfo(myPayment, paymentAmount)
    }
    else {
      this.addPaymentInfo(paymentAmount)
    }
  }

  private updatePaymentInfo(myPayment: MyPayment, paymentAmount: Money) {
    this.apiRoot.me()
      .payments()
      .withId({
        ID: myPayment.id
      })
      .post({
        body:{
          version: myPayment.version,
          actions: [
            {
              action: 'changeAmountPlanned',
              amount: paymentAmount
            }
          ]
        }
      })
      .execute()
      .then(({body}: ClientResponse<MyPayment>) => {
        this.updatePaymentInfoInSessionAndSubject(body)
      })
  }

  private addPaymentInfo(paymentAmount: Money) {
    const paymentDraft = this.createPaymentDraft(paymentAmount)
    this.apiRoot.me()
      .payments()
      .post({
        body: paymentDraft
      })
      .execute()
      .then(({body}: ClientResponse<MyPayment>) => {
        this.updatePaymentInfoInSessionAndSubject(body)
      })
  }

  private createPaymentDraft(paymentAmount: Money) {
    const paymentDraft: MyPaymentDraft = {
      amountPlanned: paymentAmount,
      paymentMethodInfo: this.createPaymentMethodInfo()
    }
    return paymentDraft
  }

  private createPaymentMethodInfo() {
    const paymentMethodInfo: PaymentMethodInfo = {
      method: 'Credit card'
    }
    return paymentMethodInfo
  }

  private updatePaymentInfoInSessionAndSubject(myPayment: MyPayment) {
    localStorage.setItem('session_payment_info', JSON.stringify(myPayment))
    this.paymentUpdatedSubject.next(true)
  }

}
