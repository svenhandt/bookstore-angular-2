import { Injectable } from '@angular/core';
import {AbstractCommercetoolsService} from "./abstract/abstract.commercetools.service";
import {CommercetoolsApiService} from "./infrastructure/commercetools.api.service";
import {
  ClientResponse,
  Money,
  MyPayment,
  MyPaymentDraft, MyPaymentUpdateAction,
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

  addOrChangeAmountInPaymentInfo(paymentAmount: Money) {
    const myPaymentAsStr = localStorage.getItem('session_payment_info')
    if(myPaymentAsStr) {
      const myPayment = JSON.parse(myPaymentAsStr) as MyPayment
      this.changeAmountInPaymentInfo(myPayment, paymentAmount)
    }
    else {
      this.addPaymentInfo(paymentAmount)
    }
  }

  addChargeTransactionToPaymentInfo() {
    const myPaymentAsStr = localStorage.getItem('session_payment_info')
    if(myPaymentAsStr) {
      const myPayment = JSON.parse(myPaymentAsStr) as MyPayment
      const addChargeTransactionAction: MyPaymentUpdateAction = {
        action: "addTransaction",
        transaction: {
          type: "Authorization",
          amount: myPayment.amountPlanned
        }
      }
      this.updatePaymentInfo(myPayment, [addChargeTransactionAction])
    }
  }

  checkHasPaymentInfo() {
    return !!localStorage.getItem('session_payment_info')
  }

  resetPaymentUpdated() {
    this.paymentUpdatedSubject.next(false)
  }

  private changeAmountInPaymentInfo(myPayment: MyPayment, paymentAmount: Money) {
    const changeAmountInPaymentInfoAction: MyPaymentUpdateAction = {
      action: 'changeAmountPlanned',
      amount: paymentAmount
    }
    this.updatePaymentInfo(myPayment, [changeAmountInPaymentInfoAction])
  }

  private updatePaymentInfo(myPayment: MyPayment, paymentUpdateActions: MyPaymentUpdateAction[]) {
    this.apiRoot.me()
      .payments()
      .withId({
        ID: myPayment.id
      })
      .post({
        body:{
          version: myPayment.version,
          actions: paymentUpdateActions
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
    console.log(myPayment)
    localStorage.setItem('session_payment_info', JSON.stringify(myPayment))
    this.paymentUpdatedSubject.next(true)
  }

}
