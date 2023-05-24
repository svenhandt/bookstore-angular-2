import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from "@angular/forms";
import {CustomerDraft, MyCustomerDraft} from "@commercetools/platform-sdk";
import {CartService} from "../../services/cart.service";
import {CustomerService} from "../../services/customer.service";

@Component({
  selector: 'app-login-register-page',
  templateUrl: './login-register-page.component.html',
  styleUrls: ['./login-register-page.component.css']
})
export class LoginRegisterPageComponent implements OnInit {

  @ViewChild('registerForm', {static: false}) registerForm: NgForm;

  constructor(private cartService: CartService,
              private customerService: CustomerService) { }

  ngOnInit(): void {
  }

  registerPasswordFieldValuesEqual() {
    let result = false
    if(this.registerForm && this.registerForm.value) {
      const registerPassword = this.registerForm.value.registerPassword
      const registerPasswordRepeat = this.registerForm.value.registerPasswordRepeat
      result = registerPassword === registerPasswordRepeat
    }
    return result
  }

  onRegister() {
    if(this.registerForm && this.registerForm.value) {
      const customerToRegister = this.createCustomerToRegister()
      this.customerService.registerCustomer(customerToRegister)
    }
  }

  private createCustomerToRegister(): MyCustomerDraft {
    const customerToRegister: MyCustomerDraft = {
      email: this.registerForm.value.registerEmail,
      password: this.registerForm.value.registerPassword,
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      addresses: [
        {
          country: 'DE',
          firstName: this.registerForm.value.firstName,
          lastName: this.registerForm.value.lastName,
          streetName: this.registerForm.value.street,
          streetNumber: this.registerForm.value.streetNumber,
          postalCode: this.registerForm.value.zipCode,
          city: this.registerForm.value.town
        }
      ],
      defaultShippingAddress: 0,
      defaultBillingAddress: 0
    }
    return customerToRegister
  }

  private getCurrentCartId(): string {
    let result = ''
    const currentCart = this.cartService.cartSubject.getValue()
    if(currentCart && currentCart.id) {
      result = currentCart.id
    }
    return result
  }

}
