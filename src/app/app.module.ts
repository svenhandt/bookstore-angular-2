import {LOCALE_ID, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductListPageComponent } from './pages/product-list-page/product-list-page.component';
import { ProductDetailsPageComponent } from './pages/product-details-page/product-details-page.component';
import { CartPageComponent } from './pages/cart-page/cart-page.component';
import { CheckoutPageComponent } from './pages/checkout-page/checkout-page.component';
import { CheckoutSummaryPageComponent } from './pages/checkout-summary-page/checkout-summary-page.component';
import { OrderConfirmationPageComponent } from './pages/order-confirmation-page/order-confirmation-page.component';
import { OrderHistoryPageComponent } from './pages/order-history-page/order-history-page.component';
import { OrderHistoryDetailsPageComponent } from './pages/order-history-details-page/order-history-details-page.component';
import { LoginRegisterPageComponent } from './pages/login-register-page/login-register-page.component';
import { EditCustomerDetailsPageComponent } from './pages/edit-customer-details-page/edit-customer-details-page.component';
import {HeaderComponent} from './pages/shared/header/header-component';
import {HomepageComponent} from "./pages/homepage/homepage.component";
import { SmallHeaderComponent } from './pages/shared/small-header/small-header.component';
import { CheckoutFooterComponent } from './pages/shared/checkout-footer/checkout-footer.component';
import {allIcons, NgxBootstrapIconsModule} from "ngx-bootstrap-icons";
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import {FormsModule} from "@angular/forms";
import { LocalizedPipe } from './pipes/localized.pipe';
import { MatchPasswordDirective } from './directives/match-password.directive';

registerLocaleData(localeDe)

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    ProductListPageComponent,
    ProductDetailsPageComponent,
    CartPageComponent,
    CheckoutPageComponent,
    CheckoutSummaryPageComponent,
    OrderConfirmationPageComponent,
    OrderHistoryPageComponent,
    OrderHistoryDetailsPageComponent,
    LoginRegisterPageComponent,
    EditCustomerDetailsPageComponent,
    HeaderComponent,
    SmallHeaderComponent,
    CheckoutFooterComponent,
    LocalizedPipe,
    MatchPasswordDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NgxBootstrapIconsModule.pick(allIcons)
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'de-DE' }],
  bootstrap: [AppComponent]
})
export class AppModule {

}
