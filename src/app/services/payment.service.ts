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
import {SESSION_PAYMENT_INFO} from "../data/constants";

@Injectable({
  providedIn: 'root'
})
export class PaymentService extends AbstractCommercetoolsService {

  private paymentAmountUpdatedSubject = new BehaviorSubject<boolean>(false)
  paymentAmountUpdated$ = this.paymentAmountUpdatedSubject.asObservable()

  private paymentAuthorizedSubject = new BehaviorSubject<boolean>(false)
  paymentAuthorized$ = this.paymentAuthorizedSubject.asObservable()

  constructor(commercetoolsApiService: CommercetoolsApiService) {
    super(commercetoolsApiService)
  }

  addOrChangeAmountInPaymentInfo(paymentAmount: Money) {
    const myPaymentAsStr = localStorage.getItem(SESSION_PAYMENT_INFO)
    if(myPaymentAsStr) {
      const myPayment = JSON.parse(myPaymentAsStr) as MyPayment
      this.changeAmountInPaymentInfo(myPayment, paymentAmount)
    }
    else {
      this.addPaymentInfo(paymentAmount)
    }
  }

  addAuthorizeTransactionToPaymentInfo() {
    const myPaymentAsStr = localStorage.getItem(SESSION_PAYMENT_INFO)
    if(myPaymentAsStr) {
      const myPayment = JSON.parse(myPaymentAsStr) as MyPayment
      const addAuthorizationTransactionAction: MyPaymentUpdateAction = {
        action: "addTransaction",
        transaction: {
          type: "Authorization",
          amount: myPayment.amountPlanned
        }
      }
      this.updatePaymentInfo(myPayment, [addAuthorizationTransactionAction]).then(({body}: ClientResponse<MyPayment>) => {
        this.updatePaymentAuthStatusInSessionAndSubject(body)
      })
    }
  }

  checkHasPaymentInfo() {
    return !!localStorage.getItem(SESSION_PAYMENT_INFO)
  }

  resetPaymentUpdated() {
    this.paymentAmountUpdatedSubject.next(false)
  }

  resetAll() {
    this.paymentAmountUpdatedSubject.next(false)
    this.paymentAuthorizedSubject.next(false)
    localStorage.removeItem(SESSION_PAYMENT_INFO)
  }

  private changeAmountInPaymentInfo(myPayment: MyPayment, paymentAmount: Money) {
    const changeAmountInPaymentInfoAction: MyPaymentUpdateAction = {
      action: 'changeAmountPlanned',
      amount: paymentAmount
    }
    this.updatePaymentInfo(myPayment, [changeAmountInPaymentInfoAction])
      .then(({body}: ClientResponse<MyPayment>) => {
      this.updatePaymentAmountInSessionAndSubject(body)
    })
  }

  private updatePaymentInfo(myPayment: MyPayment, paymentUpdateActions: MyPaymentUpdateAction[]): Promise<ClientResponse<MyPayment>> {
    return this.apiRoot.me()
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
        this.updatePaymentAmountInSessionAndSubject(body)
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

  private updatePaymentAmountInSessionAndSubject(myPayment: MyPayment) {
    console.log(myPayment)
    localStorage.setItem(SESSION_PAYMENT_INFO, JSON.stringify(myPayment))
    this.paymentAmountUpdatedSubject.next(true)
  }

  private updatePaymentAuthStatusInSessionAndSubject(myPayment: MyPayment) {
    localStorage.setItem(SESSION_PAYMENT_INFO, JSON.stringify(myPayment))
    if(this.isPaymentAuthorized(myPayment)) {
      this.paymentAuthorizedSubject.next(true)
    }
  }

  private isPaymentAuthorized(myPayment: MyPayment) {
    let isPaymentAuthorized = false
    const transactions = myPayment.transactions
    for(const transaction of transactions) {
      if(transaction.type === 'Authorization') {
        isPaymentAuthorized = true
      }
    }
    return isPaymentAuthorized
  }

}
