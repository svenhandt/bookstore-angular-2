import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgForm} from "@angular/forms";
import {MyCustomerDraft, MyCustomerSignin} from "@commercetools/platform-sdk";
import {CartService} from "../../services/cart.service";
import {CustomerService, LoginSuccess, RegistrationSuccess} from "../../services/customer.service";
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
  private logoutSuccessSubscription: Subscription
  private registrationSuccessSubscription: Subscription

  showCredentialsError = false
  showCustomerAlreadyRegisteredError = false
  showAnotherRegistrationError = false
  showLoggedOutMessage = false

  constructor(private cartService: CartService,
              private customerService: CustomerService,
              private router: Router) { }

  ngOnInit(): void {
    this.loginSuccessSubscription = this.customerService.loginSuccess$
      .subscribe((loginSuccess: LoginSuccess) => this.handleLoginSuccessSubscription(loginSuccess))
    this.registrationSuccessSubscription = this.customerService.registrationSuccess$
      .subscribe((registrationSuccess: RegistrationSuccess) => this.handleRegistrationSuccessSubscription(registrationSuccess))
    this.logoutSuccessSubscription = this.customerService.logoutSuccess$.subscribe((logoutSuccess: boolean) => this.handleLogoutSuccessSubscription(logoutSuccess))
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

  onResetLoginForm() {
    this.loginForm.reset()
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

  private handleLoginSuccessSubscription(loginSuccess: LoginSuccess) {
    if(loginSuccess === LoginSuccess.SUCCESS) {
      this.navigateToNextTarget()
    }
    if(loginSuccess === LoginSuccess.WRONG_CREDENTIALS) {
      this.showCredentialsError = true
    }
    if(loginSuccess === LoginSuccess.UNKNOWN) {
      this.showCredentialsError = false
    }
  }

  private handleRegistrationSuccessSubscription(registrationSuccess: RegistrationSuccess) {
    if(registrationSuccess === RegistrationSuccess.SUCCESS) {
      this.navigateToNextTarget()
    }
    if(registrationSuccess === RegistrationSuccess.CUSTOMER_ALREADY_REGISTERED) {
      this.showCustomerAlreadyRegisteredError = true
    }
    if(registrationSuccess === RegistrationSuccess.OTHER_ERROR) {
      this.showAnotherRegistrationError = true
    }
    if(registrationSuccess === RegistrationSuccess.UNKNOWN) {
      this.showCustomerAlreadyRegisteredError = false
    }
  }

  private handleLogoutSuccessSubscription(logoutSuccess: boolean) {
    if(logoutSuccess) {
      this.showLoggedOutMessage = true
      setTimeout(() => {
        this.showLoggedOutMessage = false
        this.customerService.logoutSuccessSubject.next(false)
      }, 2000)
    }
  }

  private navigateToNextTarget() {
    console.log('navigating now!')
    const isCheckoutLogin = this.customerService.checkoutLoginSubject.getValue()
    if(isCheckoutLogin) {
      this.customerService.checkoutLoginSubject.next(false)
      this.router.navigate(['/checkout'])
    }
    else {
      this.router.navigate(['/'])
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
    this.customerService.loginSuccessSubject.next(LoginSuccess.UNKNOWN)
    this.customerService.registrationSuccessSubject.next(RegistrationSuccess.UNKNOWN)
    this.customerService.checkoutLoginSubject.next(false)
    if(this.loginSuccessSubscription) {
      this.loginSuccessSubscription.unsubscribe()
    }
    if(this.registrationSuccessSubscription) {
      this.registrationSuccessSubscription.unsubscribe()
    }
    if(this.logoutSuccessSubscription) {
      this.logoutSuccessSubscription.unsubscribe()
    }
  }

}
