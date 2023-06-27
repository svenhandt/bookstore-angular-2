import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Observable} from "rxjs";
import {PaymentService} from "../../payment.service";

@Injectable({
  providedIn: 'root'
})
export class PaymentGuardService implements CanActivate {

  constructor(private paymentService: PaymentService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(this.paymentService.checkHasPaymentInfo()) {
      return true
    }
    return this.router.navigate(['/checkout']);
  }
}
