import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {map, Observable, take} from "rxjs";
import {CustomerService} from "../customer.service";
import {CustomerModel} from "../../data/customer.model";

@Injectable({
  providedIn: 'root'
})
export class LoginPageGuardService implements CanActivate {

  constructor(private customerService: CustomerService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.customerService.currentCustomer$.pipe(
      take(1),
      map((customer: CustomerModel) => {
        if(!customer) {
          return true
        }
        return this.router.createUrlTree(['/']);
      })
    )
  }
}
