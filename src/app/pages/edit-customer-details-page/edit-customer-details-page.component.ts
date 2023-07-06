import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CustomerService} from "../../services/customer.service";
import {Observable, Subscription, tap} from "rxjs";
import {CustomerModel} from "../../data/customer.model";
import {AddressModel} from "../../data/address.model";

@Component({
  selector: 'app-edit-customer-details-page',
  templateUrl: './edit-customer-details-page.component.html',
  styleUrls: ['./edit-customer-details-page.component.css']
})
export class EditCustomerDetailsPageComponent implements OnInit, OnDestroy {

  editCustomerForm: FormGroup

  currentCustomer$: Observable<CustomerModel>
  customerUpdateSuccess$: Observable<boolean>

  constructor(private customerService: CustomerService) { }

  ngOnInit(): void {
    this.currentCustomer$ = this.customerService.currentCustomer$.pipe(
      tap(customer => {
        if(customer) {
          this.initCustomerForm(customer)
        }
      })
    )
    this.customerUpdateSuccess$ = this.customerService.customerUpdateSuccess$.pipe(
      tap(customerUpdateSuccess => {
        this.resetCustomerUpdateSuccessAfterDelay(customerUpdateSuccess)
      })
    )
  }

  onSubmitEditCustomerForm() {
    const customerUpdateDraft = {
      firstName: this.editCustomerForm.value['firstName'],
      lastName: this.editCustomerForm.value['lastName'],
      address: {
        street: this.editCustomerForm.value['address']['street'],
        streetNumber: this.editCustomerForm.value['address']['streetNumber'],
        zipCode: this.editCustomerForm.value['address']['zipCode'],
        town: this.editCustomerForm.value['address']['town']
      }
    }
    this.customerService.checkAndUpdateCurrentCustomer(customerUpdateDraft)
  }

  get editCustomerFormControl() {
    return this.editCustomerForm.controls
  }

  get editCustomerFormAddressControl() {
    const addressFormGroup = this.editCustomerForm.controls['address'] as FormGroup
    return addressFormGroup.controls
  }

  private initCustomerForm(customer: CustomerModel) {
    const firstName = customer.firstName
    const lastName = customer.lastName
    const address = customer.address
    this.editCustomerForm = new FormGroup({
      'firstName': new FormControl(firstName, Validators.required),
      'lastName': new FormControl(lastName, Validators.required),
      'address': this.initCustomerFormAddress(address),
    })
  }

  private initCustomerFormAddress(address: AddressModel) {
    let addressFormGroup
    if(address) {
      const street = address.street
      const streetNumber = address.streetNumber
      const zipCode = address.zipCode
      const town = address.town
      addressFormGroup = new FormGroup({
        'street': new FormControl(street, Validators.required),
        'streetNumber': new FormControl(streetNumber, Validators.required),
        'zipCode': new FormControl(zipCode, [Validators.required, Validators.pattern(/^[0-9]{5}$/)]),
        'town': new FormControl(town, Validators.required)
      })
    }
    else {
      addressFormGroup = new FormGroup({})
    }
    return addressFormGroup
  }

  private resetCustomerUpdateSuccessAfterDelay(customerUpdateSuccess: boolean) {
    if(customerUpdateSuccess) {
      setTimeout(() => {
        this.customerService.customerUpdateSuccessSubject.next(false)
      }, 3000)
    }
  }

  ngOnDestroy(): void {
    this.customerService.customerUpdateSuccessSubject.next(false)
  }

}
