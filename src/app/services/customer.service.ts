import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {CustomerModel} from "../data/customer.model";
import {
  ClientResponse,
  Customer,
  CustomerSignin,
  CustomerSignInResult,
  ErrorResponse,
  InvalidCredentialsError,
  MyCustomerDraft,
  MyCustomerSignin
} from "@commercetools/platform-sdk";
import {AddressModel} from "../data/address.model";
import {CommercetoolsApiService} from "./infrastructure/commercetools.api.service";
import {AbstractCommercetoolsService} from "./abstract/abstract.commercetools.service";
import {CartService} from "./cart.service";

const CURRENT_CUSTOMER = 'current_customer'

export enum LoginSuccess {
  SUCCESS, WRONG_CREDENTIALS, UNKNOWN
}

export enum RegistrationSuccess {
  SUCCESS, CUSTOMER_ALREADY_REGISTERED, OTHER_ERROR, UNKNOWN
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService extends AbstractCommercetoolsService {

  currentCustomerSubject = new BehaviorSubject<CustomerModel>(null)
  currentCustomer$ = this.currentCustomerSubject.asObservable()

  loginSuccessSubject = new BehaviorSubject<LoginSuccess>(LoginSuccess.UNKNOWN)
  loginSuccess$ = this.loginSuccessSubject.asObservable()

  logoutSuccessSubject = new BehaviorSubject<boolean>(false)
  logoutSuccess$ = this.logoutSuccessSubject.asObservable()

  registrationSuccessSubject = new BehaviorSubject<RegistrationSuccess>(RegistrationSuccess.UNKNOWN)
  registrationSuccess$ = this.registrationSuccessSubject.asObservable()

  checkoutLoginSubject = new BehaviorSubject<boolean>(false)

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
        console.log(body)
        this.handleRegistrationSuccess(body, newCustomer)
      })
      .catch(({body}) => {
        this.handleRegistrationFail(body)
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
      .catch((error: InvalidCredentialsError)  => {
        this.loginSuccessSubject.next(LoginSuccess.WRONG_CREDENTIALS)
      })
  }

  logoutCurrentCustomer() {
    localStorage.removeItem(CURRENT_CUSTOMER)
    this.commercetoolsApiService.buildApiRoot()
    this.currentCustomerSubject.next(null)
    this.loginSuccessSubject.next(LoginSuccess.UNKNOWN)
    this.logoutSuccessSubject.next(true)
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
    const customer = this.currentCustomerSubject.getValue()
    this.cartService.setBillingAndShippingAddress(customer.address)
    this.registrationSuccessSubject.next(RegistrationSuccess.SUCCESS)
  }

  handleRegistrationFail(errorResponse: ErrorResponse) {
    const errorObjects = errorResponse.errors
    for(const errorObject of errorObjects) {
      if(errorObject.code === 'DuplicateField' && errorObject.field === 'email') {
        this.registrationSuccessSubject.next(RegistrationSuccess.CUSTOMER_ALREADY_REGISTERED)
      }
      else {
        this.registrationSuccessSubject.next(RegistrationSuccess.OTHER_ERROR)
      }
    }
  }

  private handleLoginSuccess(customerSignInResult: CustomerSignInResult, customerSignin: CustomerSignin) {
    this.handleAuthenticationSuccess(customerSignInResult, customerSignin.password)
    this.loginSuccessSubject.next(LoginSuccess.SUCCESS)
  }

  private handleAuthenticationSuccess(customerSignInResult: CustomerSignInResult, password: string) {
    const customer = this.createCustomer(customerSignInResult.customer)
    customer.password = password
    localStorage.setItem(CURRENT_CUSTOMER, JSON.stringify(customer))
    this.commercetoolsApiService.buildApiRoot()
    this.currentCustomerSubject.next(customer)
    this.cartService.setCurrentCart(customerSignInResult.cart)
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
