import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {CustomerModel} from "../data/customer.model";
import {
  ClientResponse,
  Customer, CustomerSignin,
  CustomerSignInResult,
  MyCustomerDraft,
  MyCustomerSignin
} from "@commercetools/platform-sdk";
import {AddressModel} from "../data/address.model";
import {CommercetoolsApiService} from "./infrastructure/commercetools.api.service";
import {AbstractCommercetoolsService} from "./abstract/abstract.commercetools.service";
import {CartService} from "./cart.service";
import {Router} from "@angular/router";
import {BadRequest} from "@commercetools/sdk-client-v2/dist/declarations/src/sdk-client/errors";

const CURRENT_CUSTOMER = 'current_customer'

export enum AuthenticationSuccess {
  SUCCESS, WRONG_CREDENTIALS, UNKNOWN
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService extends AbstractCommercetoolsService {

  currentCustomerSubject = new BehaviorSubject<CustomerModel>(null)
  currentCustomer$ = this.currentCustomerSubject.asObservable()

  loginSuccessSubject = new BehaviorSubject<AuthenticationSuccess>(AuthenticationSuccess.UNKNOWN)
  loginSuccess$ = this.loginSuccessSubject.asObservable()

  constructor(commercetoolsApiService: CommercetoolsApiService,
              private cartService: CartService) {
    super(commercetoolsApiService)
    this.initCurrentCustomer()
  }

  registerCustomer(newCustomer: MyCustomerDraft) {
    this.apiRoot.me()
      .signup()
      .post(
        {
          body: newCustomer
        }
      )
      .execute()
      .then(({body}: ClientResponse<CustomerSignInResult>) => {
        this.handleRegistrationSuccess(body, newCustomer)
      })
  }

  loginCustomer(customerSignin: MyCustomerSignin) {
    this.apiRoot.me()
      .login()
      .post({
        body: customerSignin
      })
      .execute()
      .then(({body}: ClientResponse<CustomerSignInResult>) => {
        this.handleLoginSuccess(body, customerSignin)
      })
      .catch(error => {
        console.log(error)
        /*
        if(error instanceof BadRequest) {
        }

         */
        this.loginSuccessSubject.next(AuthenticationSuccess.WRONG_CREDENTIALS)
      })
  }

  logoutCurrentCustomer() {
    localStorage.removeItem(CURRENT_CUSTOMER)
    this.commercetoolsApiService.buildApiRoot()
    this.currentCustomerSubject.next(null)
    this.loginSuccessSubject.next(AuthenticationSuccess.UNKNOWN)
    this.cartService.retrieveCurrentCart()
  }

  private initCurrentCustomer() {
    const currentCustomerStr = localStorage.getItem(CURRENT_CUSTOMER)
    if(currentCustomerStr) {
      const currentCustomer = <CustomerModel>JSON.parse(currentCustomerStr)
      if(currentCustomer.id) {
        this.currentCustomerSubject.next(currentCustomer)
      }
    }
  }

  private handleRegistrationSuccess(customerSignInResult: CustomerSignInResult, newCustomer: MyCustomerDraft) {
    this.handleAuthenticationSuccess(customerSignInResult, newCustomer.password)
  }

  private handleLoginSuccess(customerSignInResult: CustomerSignInResult, customerSignin: CustomerSignin) {
    this.handleAuthenticationSuccess(customerSignInResult, customerSignin.password)
    this.loginSuccessSubject.next(AuthenticationSuccess.SUCCESS)
  }

  private handleAuthenticationSuccess(customerSignInResult: CustomerSignInResult, password: string) {
    const customer = this.createCustomer(customerSignInResult.customer)
    customer.password = password
    localStorage.setItem(CURRENT_CUSTOMER, JSON.stringify(customer))
    this.commercetoolsApiService.buildApiRoot()
    this.currentCustomerSubject.next(customer)
    this.cartService.retrieveCurrentCart()
  }

  private createCustomer(rawCustomer: Customer) {
    let customer: CustomerModel = null
    if(rawCustomer) {
      customer = new CustomerModel()
      customer.id = rawCustomer.id
      customer.version = rawCustomer.version
      customer.email = rawCustomer.email
      customer.firstName = rawCustomer.firstName
      customer.lastName = rawCustomer.lastName
      customer.address = this.createAddress(rawCustomer)
    }
    return customer
  }

  private createAddress(rawCustomer: Customer) {
    let address: AddressModel = null
    const rawAddresses = rawCustomer.addresses
    if(rawAddresses && rawAddresses.length > 0) {
      const rawAddress = rawAddresses[0]
      address = new AddressModel()
      address.id = rawAddress.id
      address.firstName = rawAddress.firstName
      address.lastName = rawAddress.lastName
      address.street = rawAddress.streetName
      address.streetNumber = rawAddress.streetNumber
      address.zipCode = rawAddress.postalCode
      address.town = rawAddress.city
      address.country = rawAddress.country
    }
    return address
  }

}
