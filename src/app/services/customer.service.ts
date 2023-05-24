import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {CustomerModel} from "../data/customer.model";
import {
  ClientResponse,
  Customer,
  CustomerDraft,
  CustomerSignInResult,
  MyCustomerDraft
} from "@commercetools/platform-sdk";
import apiRoot, {clearTokenCache, rebuildApiRoot} from "./builder/BuildClient";
import {AddressModel} from "../data/address.model";

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  currentCustomerSubject = new BehaviorSubject<CustomerModel>(null)
  currentCustomer$ = this.currentCustomerSubject.asObservable()

  constructor() {

  }

  registerCustomer(newCustomer: MyCustomerDraft) {
    apiRoot.me()
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

  private handleRegistrationSuccess(customerSignInResult: CustomerSignInResult, newCustomer: MyCustomerDraft) {
    const customer = this.createCustomer(customerSignInResult.customer)
    customer.password = newCustomer.password
    localStorage.setItem('current_customer', JSON.stringify(customer))
    rebuildApiRoot()
    this.currentCustomerSubject.next(customer)
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
