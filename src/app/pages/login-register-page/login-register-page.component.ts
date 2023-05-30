import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgForm} from "@angular/forms";
import {MyCustomerDraft, MyCustomerSignin} from "@commercetools/platform-sdk";
import {CartService} from "../../services/cart.service";
import {AuthenticationSuccess, CustomerService} from "../../services/customer.service";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-login-register-page',
  templateUrl: './login-register-page.component.html',
  styleUrls: ['./login-register-page.component.css']
})
export class LoginRegisterPageComponent implements OnInit, OnDestroy {

  @ViewChild('registerForm', {static: false}) registerForm: NgForm;
  @ViewChild('loginForm', {static: false}) loginForm: NgForm;

  private loginSuccessSubscription: Subscription

  constructor(private cartService: CartService,
              private customerService: CustomerService,
              private router: Router) { }

  ngOnInit(): void {
    this.loginSuccessSubscription = this.customerService.loginSuccess$.subscribe((authenticationSuccess: AuthenticationSuccess) => {
      if(authenticationSuccess === AuthenticationSuccess.SUCCESS) {
        this.router.navigate(['/'])
      }
    })
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
      this.router.navigate(['/'])
    }
  }

  onResetRegisterForm() {
    this.registerForm.reset()
  }

  onLogin() {
    if(this.loginForm && this.loginForm.value) {
      const customerSignin = this.createCustomerSignin()
      this.customerService.loginCustomer(customerSignin)
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

  private createCustomerSignin(): MyCustomerSignin {
    const customerSignin: MyCustomerSignin = {
      email: this.loginForm.value.loginEmail,
      password: this.loginForm.value.loginPassword
    }
    return customerSignin
  }

  ngOnDestroy(): void {
    if(this.loginSuccessSubscription) {
      this.loginSuccessSubscription.unsubscribe()
    }
  }

}
