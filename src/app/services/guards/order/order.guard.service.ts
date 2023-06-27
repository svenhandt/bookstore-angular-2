import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Observable} from "rxjs";
import {LAST_CREATED_ORDER} from "../../order.service";
import {OrderModel} from "../../../data/order.model";

@Injectable({
  providedIn: 'root'
})
export class OrderGuardService implements CanActivate {

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const createdOrderStr = localStorage.getItem(LAST_CREATED_ORDER)
    const createdOrder = JSON.parse(createdOrderStr) as OrderModel
    if(createdOrder) {
      return true
    }
    return this.router.createUrlTree(['/']);
  }
}
