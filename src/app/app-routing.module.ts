import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomepageComponent} from "./pages/homepage/homepage.component";
import {ProductListPageComponent} from "./pages/product-list-page/product-list-page.component";
import {ProductDetailsPageComponent} from "./pages/product-details-page/product-details-page.component";
import {CartPageComponent} from "./pages/cart-page/cart-page.component";
import {CheckoutPageComponent} from "./pages/checkout-page/checkout-page.component";
import {CheckoutSummaryPageComponent} from "./pages/checkout-summary-page/checkout-summary-page.component";
import {OrderConfirmationPageComponent} from "./pages/order-confirmation-page/order-confirmation-page.component";
import {OrderHistoryPageComponent} from "./pages/order-history-page/order-history-page.component";
import {
  OrderHistoryDetailsPageComponent
} from "./pages/order-history-details-page/order-history-details-page.component";
import {LoginRegisterPageComponent} from "./pages/login-register-page/login-register-page.component";
import {
  EditCustomerDetailsPageComponent
} from "./pages/edit-customer-details-page/edit-customer-details-page.component";
import {AuthGuardService} from "./services/guards/auth/auth.guard.service";
import {LoginPageGuardService} from "./services/guards/auth/login.page.guard.service";
import {OrderGuardService} from "./services/guards/order/order.guard.service";
import {PaymentGuardService} from "./services/guards/payment/payment.guard.service";

const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: HomepageComponent},
  {path: 'product-list', component: ProductListPageComponent},
  {path: 'product-details/:id', component: ProductDetailsPageComponent},
  {path: 'cart', component: CartPageComponent},
  {path: 'checkout', component: CheckoutPageComponent, canActivate: [AuthGuardService]},
  {path: 'checkout-summary', component: CheckoutSummaryPageComponent, canActivate: [AuthGuardService, PaymentGuardService]},
  {path: 'order-confirmation', component: OrderConfirmationPageComponent, canActivate: [AuthGuardService, OrderGuardService]},
  {path: 'order-history', component: OrderHistoryPageComponent, canActivate: [AuthGuardService]},
  {path: 'order-history-details', component: OrderHistoryDetailsPageComponent, canActivate: [AuthGuardService]},
  {path: 'login-register', component: LoginRegisterPageComponent, canActivate: [LoginPageGuardService]},
  {path: 'edit-customer', component: EditCustomerDetailsPageComponent, canActivate: [AuthGuardService]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
