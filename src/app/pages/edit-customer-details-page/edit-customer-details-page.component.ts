import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CustomerService} from "../../services/customer.service";
import {Subscription} from "rxjs";
import {CustomerModel} from "../../data/customer.model";
import {AddressModel} from "../../data/address.model";

@Component({
  selector: 'app-edit-customer-details-page',
  templateUrl: './edit-customer-details-page.component.html',
  styleUrls: ['./edit-customer-details-page.component.css']
})
export class EditCustomerDetailsPageComponent implements OnInit, OnDestroy {

  private currentCustomerSubscription: Subscription
  editCustomerForm: FormGroup

  constructor(private customerService: CustomerService) { }

  ngOnInit(): void {
    this.currentCustomerSubscription = this.customerService.currentCustomer$.subscribe((customer => {
      if(customer) {
        this.initCustomerForm(customer)
      }
    }))
  }

  private initCustomerForm(customer: CustomerModel) {
    const firstName = customer.firstName
    const lastName = customer.lastName
    const email = customer.email
    const address = customer.address
    if(address) {
      const addressFormGroup = this.initCustomerFormAddress(address)
    }

  }

  private initCustomerFormAddress(address: AddressModel) {
    const street = address.street
    const streetNumber = address.streetNumber
    const zipCode = address.zipCode
    const town = address.town
    const addressFormGroup = new FormGroup({
      'street': new FormControl(street, Validators.required),
      'streetNumber': new FormControl(streetNumber, Validators.required),
      'zipCode': new FormControl(zipCode, [Validators.required, Validators.pattern(/^[0-9]{5}$/)]),
      'town': new FormControl(town, Validators.required)
    })
    return addressFormGroup
  }

  ngOnDestroy(): void {

  }

}
